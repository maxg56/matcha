import { apiService } from './api';

export interface UserMatchStats {
  user_id: number;
  username?: string;
  total_matches: number;
  total_likes: number;
  total_passes: number;
  total_blocks: number;
  match_rate: number;
  last_active?: string;
}

export interface AdminStatsResponse {
  total_users: number;
  total_matches: number;
  total_interactions: number;
  overall_match_rate: number;
  top_users: UserMatchStats[];
  daily_stats: DayStats[];
  interaction_types: InteractionStat[];
}

export interface DayStats {
  date: string;
  new_matches: number;
  new_interactions: number;
  active_users: number;
}

export interface InteractionStat {
  type: string;
  count: number;
}

export interface TrendData {
  date: string;
  matches: number;
  likes: number;
  passes: number;
}

export interface MatchTrendsResponse {
  trends: TrendData[];
  period_days: number;
}

class AdminService {
  private baseUrl = '/api/v1/admin';

  async getAdminStats(): Promise<AdminStatsResponse> {
    return await apiService.get<AdminStatsResponse>(`${this.baseUrl}/stats`);
  }

  async getUserStats(userId: number): Promise<UserMatchStats> {
    return await apiService.get<UserMatchStats>(`${this.baseUrl}/stats/user/${userId}`);
  }

  async getMatchTrends(days: number = 30): Promise<MatchTrendsResponse> {
    return await apiService.get<MatchTrendsResponse>(`${this.baseUrl}/stats/trends?days=${days}`);
  }

  async clearCache(): Promise<void> {
    await apiService.post(`${this.baseUrl}/cache/clear`);
  }

  async getPerformanceStats(): Promise<any> {
    return await apiService.get(`${this.baseUrl}/performance`);
  }
}

export const adminService = new AdminService();