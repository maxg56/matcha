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
  age: number;
  height?: number;
  alcohol_consumption?: string;
  smoking?: string;
  cannabis?: string;
  drugs?: string;
  pets?: string;
  social_activity_level?: string;
  sport_activity?: string;
  education_level?: string;
  personal_opinion?: string;
  bio: string;
  current_city?: string;
  job?: string;
  religion?: string;
  relationship_type: string;
  children_status?: string;
  zodiac_sign?: string;
  hair_color?: string;
  skin_color?: string;
  eye_color?: string;
  fame: number;
  gender: string;
  political_view?: string;
  tags?: string[];
  images?: string[];
  created_at: string;
  
  // Propriétés calculées/héritées pour compatibilité
  profile_photos?: string[]; // alias pour images
  interests?: string[]; // alias pour tags
  location?: string; // sera mappé depuis current_city
  occupation?: string; // alias pour job
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

export interface MatchCandidate {
  id: number;
  algorithm_type: string;
  compatibility_score?: number;
  distance?: number;
}

export interface CandidatesResponse {
  candidates: MatchCandidate[];
  count: number;
  algorithm_type: string;
  parameters: {
    limit: number;
    max_distance?: number;
    age_range?: { min: number; max: number };
  };
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

export interface ReceivedLike {
  id: number;
  user_id: number;
  target_user_id: number;
  user_profile: UserProfile;
  created_at: string;
  is_mutual: boolean;
}

export interface ReceivedLikePreview {
  id: string;
  created_at: string;
  // Données floutées pour utilisateurs gratuits
  blurred_image: string;
  timestamp_relative: string; // "Il y a 2h", "Hier", etc.
}

export interface LikeStats {
  total_likes_received: number;
  likes_today: number;
  likes_this_week: number;
  likes_this_month: number;
  most_liked_photo?: string;
  like_rate_trend: 'increasing' | 'decreasing' | 'stable';
  average_likes_per_day: number;
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
   * Lance l'algorithme de matching pour récupérer les candidats (IDs seulement)
   */
  async getMatchingCandidates(params: MatchingAlgorithmParams = {}): Promise<CandidatesResponse> {
    return this.withRetry(async () => {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.max_distance) queryParams.append('max_distance', params.max_distance.toString());
      if (params.age_min) queryParams.append('age_min', params.age_min.toString());
      if (params.age_max) queryParams.append('age_max', params.age_max.toString());
      if (params.algorithm_type) queryParams.append('algorithm_type', params.algorithm_type);

      const endpoint = `${this.baseEndpoint}/algorithm${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return apiService.get<CandidatesResponse>(endpoint);
    });
  }

  /**
   * Lance l'algorithme de matching pour trouver de nouveaux profils (comportement legacy)
   */
  async getMatchingAlgorithm(params: MatchingAlgorithmParams = {}): Promise<AlgorithmResponse> {
    return this.withRetry(async () => {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.max_distance) queryParams.append('max_distance', params.max_distance.toString());
      if (params.age_min) queryParams.append('age_min', params.age_min.toString());
      if (params.age_max) queryParams.append('age_max', params.age_max.toString());
      if (params.algorithm_type) queryParams.append('algorithm_type', params.algorithm_type);
      
      // Forcer le mode profils complets
      queryParams.append('full_profiles', 'true');

      const endpoint = `${this.baseEndpoint}/algorithm${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return apiService.get<AlgorithmResponse>(endpoint);
    });
  }

  /**
   * Récupère un profil utilisateur par ID
   */
  async getUserProfile(userId: number): Promise<UserProfile> {
    return apiService.get<{profile: UserProfile}>(`/api/v1/users/profile/${userId}`)
      .then(response => {
        const profile = response.profile;
        
        // Ajouter les alias pour compatibilité avec les composants existants
        return {
          ...profile,
          profile_photos: profile.images,
          interests: profile.tags,
          location: profile.current_city,
          occupation: profile.job,
        };
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

  /**
   * Récupère les likes reçus (pour la fonctionnalité "Who Liked Me")
   */
  async getReceivedLikes(): Promise<ReceivedLike[]> {
    return this.withRetry(async () => {
      return apiService.get<ReceivedLike[]>(`${this.baseEndpoint}/received-likes`);
    });
  }

  /**
   * Récupère les statistiques des likes reçus
   */
  async getLikeStats(): Promise<LikeStats> {
    return this.withRetry(async () => {
      return apiService.get<LikeStats>(`${this.baseEndpoint}/like-stats`);
    });
  }

  /**
   * Récupère un aperçu limité des likes reçus pour les utilisateurs gratuits
   */
  async getReceivedLikesPreview(limit: number = 3): Promise<ReceivedLikePreview[]> {
    return this.withRetry(async () => {
      return apiService.get<ReceivedLikePreview[]>(`${this.baseEndpoint}/received-likes/preview?limit=${limit}`);
    });
  }
}

export const matchService = new MatchService();