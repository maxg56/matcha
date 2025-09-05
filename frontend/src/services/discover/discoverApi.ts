import { apiService } from '@/services/api';

export interface ProfileImage {
  id?: number;
  url: string;
  is_primary: boolean;
  order_index: number;
}

export interface DiscoverProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  age: number;
  bio?: string;
  location?: string;
  occupation?: string;
  interests: string[];
  images: ProfileImage[];
  distance?: number;
  fame_rating: number;
  is_online: boolean;
  last_seen: string;
  compatibility_score?: number;
}

export interface Match {
  id: number;
  user: DiscoverProfile;
  matched_at: string;
  is_mutual: boolean;
}

export interface LikeResponse {
  success: boolean;
  is_match: boolean;
  match_id?: number;
  message?: string;
}

export interface DiscoverFilters {
  age_min?: number;
  age_max?: number;
  distance_max?: number;
  fame_min?: number;
  fame_max?: number;
  interests?: string[];
  location?: string;
}

export class DiscoverApiService {
  async fetchDiscoverProfiles(filters?: DiscoverFilters): Promise<DiscoverProfile[]> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.age_min) queryParams.append('age_min', filters.age_min.toString());
      if (filters.age_max) queryParams.append('age_max', filters.age_max.toString());
      if (filters.distance_max) queryParams.append('distance_max', filters.distance_max.toString());
      if (filters.fame_min) queryParams.append('fame_min', filters.fame_min.toString());
      if (filters.fame_max) queryParams.append('fame_max', filters.fame_max.toString());
      if (filters.interests && filters.interests.length > 0) {
        queryParams.append('interests', filters.interests.join(','));
      }
      if (filters.location) queryParams.append('location', filters.location);
    }

    const endpoint = `/api/matches/suggestions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiService.get<DiscoverProfile[]>(endpoint);
  }

  async fetchMatches(): Promise<Match[]> {
    return apiService.get<Match[]>('/api/matches/list');
  }

  async likeProfile(userId: number): Promise<LikeResponse> {
    return apiService.post<LikeResponse>(`/api/matches/like/${userId}`, {});
  }

  async passProfile(userId: number): Promise<void> {
    return apiService.post(`/api/matches/pass/${userId}`, {});
  }

  async superLikeProfile(userId: number): Promise<LikeResponse> {
    return apiService.post<LikeResponse>(`/api/matches/like/${userId}`, {
      is_super_like: true
    });
  }

  async reportProfile(userId: number, reason: string): Promise<void> {
    return apiService.post('/api/v1/users/report', {
      reported_user_id: userId,
      reason
    });
  }

  async blockProfile(userId: number): Promise<void> {
    return apiService.post('/api/v1/users/block', {
      blocked_user_id: userId
    });
  }

  async unblockProfile(userId: number): Promise<void> {
    return apiService.delete(`/api/v1/users/block/${userId}`);
  }

  async deleteMatch(matchId: number): Promise<void> {
    return apiService.delete(`/api/matches/${matchId}`);
  }

  async getProfile(userId: number): Promise<DiscoverProfile> {
    return apiService.get<DiscoverProfile>(`/api/v1/users/${userId}/profile`);
  }

  async getUserInterests(): Promise<string[]> {
    return apiService.get<string[]>('/api/v1/users/interests/available');
  }

  async getLocationSuggestions(query: string): Promise<string[]> {
    return apiService.get<string[]>(`/api/v1/locations/search?q=${encodeURIComponent(query)}`);
  }
}

export const discoverApi = new DiscoverApiService();