import { apiService } from './api';

export interface Match {
  id: number;
  user_id: number;
  target_user_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  target_user?: UserProfile;
}

export interface UserProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  bio?: string;
  profile_photos?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  interests?: string[];
}

export interface MatchingAlgorithmParams {
  limit?: number;
  max_distance?: number;
  age_min?: number;
  age_max?: number;
  algorithm_type?: 'vector_based' | 'basic';
}

export interface MatchesResponse {
  matches: Match[];
  count: number;
  user_id: number;
}

export interface AlgorithmResponse {
  matches: UserProfile[];
  count: number;
  algorithm_type: string;
  parameters: {
    limit: number;
    max_distance?: number;
    age_range?: { min: number; max: number };
  };
}

export interface InteractionRequest {
  target_user_id: number;
}

export interface InteractionResponse {
  success: boolean;
  is_mutual?: boolean;
  message?: string;
}

export interface UserPreferences {
  user_id: number;
  preferences: {
    age_preferences?: { min: number; max: number };
    distance_preference?: number;
    preferred_tags?: string[];
    interaction_history?: {
      likes: number;
      passes: number;
      blocks: number;
    };
  };
}

class MatchService {
  private readonly baseEndpoint = '/api/v1/matches';

  private async withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && error instanceof Error) {
        // Ne pas retry sur les erreurs de contrainte unique ou de logique métier
        if (error.message.includes('duplicate key') || 
            error.message.includes('unique constraint') ||
            error.message.includes('duplicate_interaction') ||
            error.message.includes('SQLSTATE 23505') ||
            error.message.includes('already liked') ||
            error.message.includes('already interacted')) {
          throw error;
        }
        
        // Retry pour les erreurs de rate limiting et les erreurs serveur temporaires
        if (error.message.includes('429') || 
            error.message.includes('rate') ||
            error.message.includes('500') ||
            error.message.includes('failed to record interaction')) {
          console.log(`Retrying request in ${delay}ms... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.withRetry(fn, retries - 1, delay * 2); // Exponential backoff
        }
      }
      throw error;
    }
  }

  /**
   * Récupère les matches existants de l'utilisateur
   */
  async getMatches(): Promise<MatchesResponse> {
    return apiService.get<MatchesResponse>(this.baseEndpoint);
  }

  /**
   * Lance l'algorithme de matching pour trouver de nouveaux profils
   */
  async getMatchingAlgorithm(params: MatchingAlgorithmParams = {}): Promise<AlgorithmResponse> {
    return this.withRetry(async () => {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.max_distance) queryParams.append('max_distance', params.max_distance.toString());
      if (params.age_min) queryParams.append('age_min', params.age_min.toString());
      if (params.age_max) queryParams.append('age_max', params.age_max.toString());
      if (params.algorithm_type) queryParams.append('algorithm_type', params.algorithm_type);

      const endpoint = `${this.baseEndpoint}/algorithm${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return apiService.get<AlgorithmResponse>(endpoint);
    });
  }

  /**
   * Like un utilisateur
   */
  async likeUser(targetUserId: number): Promise<InteractionResponse> {
    return this.withRetry(async () => {
      return apiService.post<InteractionResponse>(`${this.baseEndpoint}/like`, {
        target_user_id: targetUserId
      });
    });
  }

  /**
   * Unlike/passe un utilisateur
   */
  async passUser(targetUserId: number): Promise<InteractionResponse> {
    return this.withRetry(async () => {
      return apiService.post<InteractionResponse>(`${this.baseEndpoint}/unlike`, {
        target_user_id: targetUserId
      });
    });
  }

  /**
   * Bloque un utilisateur
   */
  async blockUser(targetUserId: number): Promise<InteractionResponse> {
    return this.withRetry(async () => {
      return apiService.post<InteractionResponse>(`${this.baseEndpoint}/block`, {
        target_user_id: targetUserId
      });
    });
  }

  /**
   * Récupère les préférences apprises de l'utilisateur
   */
  async getUserPreferences(): Promise<UserPreferences> {
    return apiService.get<UserPreferences>(`${this.baseEndpoint}/preferences`);
  }
}

export const matchService = new MatchService();