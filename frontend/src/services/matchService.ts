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
  latitude?: number;
  longitude?: number;
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

// Interface pour les likes basiques (retournés par l'endpoint)
export interface BasicLike {
  id: number;
  user_id: number;
  target_user_id: number;
  created_at: string;
}

// Interface pour les likes avec profil complet (pour le frontend)
export interface LikeReceived {
  id: number;
  user_id: number;
  target_user_id: number;
  created_at: string;
  user: UserProfile;
}

export interface BasicLikesResponse {
  likes: BasicLike[];
  count: number;
}

export interface ReceivedLikesResponse {
  likes: LikeReceived[];
  count: number;
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
    return this.withRetry(async () => {
      // L'API retourne une structure différente : { count, matches: UserProfile[], user_id }
      const apiResponse = await apiService.get<{
        count: number;
        matches: (UserProfile & { algorithm_type?: string })[] | null;
        user_id: number;
      }>(this.baseEndpoint);
      
      // Transformer la réponse de l'API en format attendu par le frontend
      const transformedMatches: Match[] = (apiResponse.matches || []).map((userProfile) => {
        // Créer un objet Match à partir du profil utilisateur
        const match: Match = {
          id: userProfile.id, // Utiliser l'ID de l'utilisateur comme ID du match temporaire
          user_id: apiResponse.user_id,
          target_user_id: userProfile.id,
          status: 'active',
          created_at: userProfile.created_at,
          updated_at: userProfile.created_at,
          // Le profil utilisateur devient target_user
          target_user: {
            ...userProfile,
            // Ajouter les alias pour compatibilité
            profile_photos: userProfile.images || [],
            interests: userProfile.tags || [],
            location: userProfile.current_city || '',
            occupation: userProfile.job || '',
          }
        };
        return match;
      });

      return {
        matches: transformedMatches,
        count: apiResponse.count,
        user_id: apiResponse.user_id
      };
    });
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
   * Unmatch un utilisateur (supprime le match mutuel)
   */
  async unmatchUser(targetUserId: number): Promise<InteractionResponse> {
    return this.withRetry(async () => {
      return apiService.post<InteractionResponse>(`${this.baseEndpoint}/unmatch`, {
        target_user_id: targetUserId
      });
    });
  }

  /**
   * Récupère les likes reçus par l'utilisateur avec les profils complets
   */
  async getReceivedLikes(): Promise<ReceivedLikesResponse> {
    return this.withRetry(async () => {
      // 1. Récupérer les likes basiques (IDs seulement)
      const basicResponse = await apiService.get<BasicLikesResponse>(`${this.baseEndpoint}/received-likes`);
      const basicLikes = basicResponse.likes;

      // 2. Pour chaque like, récupérer le profil complet
      const likesWithProfiles = await Promise.all(
        basicLikes.map(async (basicLike): Promise<LikeReceived> => {
          try {
            const userProfile = await this.getUserProfile(basicLike.user_id);
            return {
              ...basicLike,
              user: userProfile
            };
          } catch (profileError) {
            console.error(`Error fetching profile for user ${basicLike.user_id}:`, profileError);
            // En cas d'erreur, retourner un profil minimal
            const fallbackProfile: UserProfile = {
              id: basicLike.user_id,
              username: `user_${basicLike.user_id}`,
              first_name: 'Utilisateur',
              age: 0,
              bio: 'Profil non disponible',
              images: [],
              tags: [],
              current_city: '',
              job: '',
              fame: 0,
              gender: '',
              created_at: '',
              relationship_type: '',
              // Alias pour compatibilité
              profile_photos: [],
              interests: [],
              location: '',
              occupation: '',
            };
            return {
              ...basicLike,
              user: fallbackProfile
            };
          }
        })
      );

      return {
        likes: likesWithProfiles,
        count: likesWithProfiles.length
      };
    });
  }

  /**
   * Récupère les préférences apprises de l'utilisateur (legacy - prefer preferencesService)
   * @deprecated Use preferencesService.getUserPreferences instead
   */
  async getUserPreferences(): Promise<UserPreferences> {
    return apiService.get<UserPreferences>(`${this.baseEndpoint}/preferences`);
  }
}

export const matchService = new MatchService();