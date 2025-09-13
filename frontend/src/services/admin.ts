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

  private getHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getAdminStats(): Promise<AdminStatsResponse> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserStats(userId: number): Promise<UserMatchStats> {
    const response = await fetch(`${this.baseUrl}/stats/user/${userId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getMatchTrends(days: number = 30): Promise<MatchTrendsResponse> {
    const response = await fetch(`${this.baseUrl}/stats/trends?days=${days}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async clearCache(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/cache/clear`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async getPerformanceStats(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/performance`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

export const adminService = new AdminService();