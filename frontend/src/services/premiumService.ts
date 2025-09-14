import { apiService } from './api';
import { paymentService, type CreateCheckoutSessionRequest, type SubscriptionStatus } from './paymentService';
import type { PlanInterval } from '@/types/pricing';

// Combined premium service types
export interface PremiumStatus {
  isPremium: boolean;
  subscription: SubscriptionStatus | null;
  features: {
    unlimitedSwipes: boolean;
    whoLikesMe: boolean;
    superLikes: number;
    boosts: number;
    rewinds: boolean;
    unlimitedDistance: boolean;
    premiumChat: boolean;
  };
}

export interface BoostSession {
  id: number;
  user_id: number;
  boost_type: 'daily_boost' | 'premium_monthly' | 'super_boost';
  started_at: string;
  expires_at: string;
  is_active: boolean;
  visibility_multiplier: number;
  views_during_boost: number;
  likes_during_boost: number;
  matches_during_boost: number;
}

export interface RewindAvailability {
  can_rewind: boolean;
  last_interaction_id?: number;
  last_interaction_type?: string;
  expires_at?: string;
  time_remaining?: number; // seconds
  reason?: string;
}

export interface PremiumLimits {
  dailySwipes: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  superLikes: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  boosts: {
    used: number;
    limit: number;
  };
  rewinds: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
}

class PremiumService {
  // Payment methods (delegated to paymentService)
  async createCheckoutSession(request: CreateCheckoutSessionRequest) {
    return paymentService.createCheckoutSession(request);
  }

  async createTrialSession(plan: PlanInterval) {
    return paymentService.createTrialSession(plan);
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
    return paymentService.getSubscriptionStatus();
  }

  // Premium status
  async getPremiumStatus(): Promise<PremiumStatus> {
    try {
      const subscription = await this.getSubscriptionStatus();
      const isPremium = subscription?.is_active || false;

      return {
        isPremium,
        subscription,
        features: {
          unlimitedSwipes: isPremium,
          whoLikesMe: isPremium,
          superLikes: isPremium ? -1 : 5, // -1 = unlimited, positive number = limit
          boosts: isPremium ? 1 : 0, // monthly boost for premium
          rewinds: isPremium,
          unlimitedDistance: isPremium,
          premiumChat: isPremium
        }
      };
    } catch (error) {
      console.error('Error getting premium status:', error);
      return {
        isPremium: false,
        subscription: null,
        features: {
          unlimitedSwipes: false,
          whoLikesMe: false,
          superLikes: 5,
          boosts: 0,
          rewinds: false,
          unlimitedDistance: false,
          premiumChat: false
        }
      };
    }
  }

  // Boost functionality
  async startBoost(boostType: 'daily_boost' | 'premium_monthly' | 'super_boost' = 'daily_boost'): Promise<BoostSession> {
    try {
      return await apiService.post<BoostSession>('/api/v1/matches/premium/boost/start', {
        boost_type: boostType
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('cooldown') || error.message.includes('already_active')) {
          throw new Error('Boost en cooldown ou déjà actif. Réessayez plus tard.');
        } else if (error.message.includes('no_boosts_remaining')) {
          throw new Error('Plus de boosts disponibles. Passez au Premium pour plus de boosts !');
        } else if (error.message.includes('premium_required')) {
          throw new Error('Fonctionnalité Premium requise.');
        }
      }
      throw error;
    }
  }

  async getCurrentBoost(): Promise<BoostSession | null> {
    try {
      return await apiService.get<BoostSession>('/api/v1/matches/premium/boost/current');
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async cancelBoost(): Promise<void> {
    await apiService.post('/api/v1/matches/premium/boost/cancel');
  }

  // Rewind functionality
  async getRewindAvailability(): Promise<RewindAvailability> {
    try {
      return await apiService.get<RewindAvailability>('/api/v1/matches/premium/rewind/availability');
    } catch (error) {
      return {
        can_rewind: false,
        reason: 'Premium required for rewind functionality'
      };
    }
  }

  async performRewind(): Promise<{ success: boolean; message?: string }> {
    try {
      return await apiService.post<{ success: boolean; message?: string }>('/api/v1/matches/premium/rewind/perform');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('premium_required')) {
          throw new Error('Fonctionnalité Premium requise pour annuler les swipes');
        } else if (error.message.includes('no_recent_action')) {
          throw new Error('Aucune action récente à annuler');
        } else if (error.message.includes('rewind_expired')) {
          throw new Error('Délai d\'annulation expiré');
        } else if (error.message.includes('no_rewinds_remaining')) {
          throw new Error('Plus d\'annulations disponibles aujourd\'hui');
        }
      }
      throw error;
    }
  }

  // Usage limits
  async getPremiumLimits(): Promise<PremiumLimits> {
    try {
      return await apiService.get<PremiumLimits>('/api/v1/matches/premium/limits');
    } catch (error) {
      // Return default free tier limits
      return {
        dailySwipes: {
          used: 0,
          limit: 50,
          unlimited: false
        },
        superLikes: {
          used: 0,
          limit: 5,
          unlimited: false
        },
        boosts: {
          used: 0,
          limit: 0
        },
        rewinds: {
          used: 0,
          limit: 0,
          unlimited: false
        }
      };
    }
  }

  // Premium matching with unlimited distance
  async getPremiumMatches(params: {
    limit?: number;
    unlimited_distance?: boolean;
    global_search?: boolean;
  } = {}): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.unlimited_distance) queryParams.append('unlimited_distance', 'true');
      if (params.global_search) queryParams.append('global_search', 'true');

      const endpoint = `/api/v1/matches/premium/candidates${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiService.get<{profiles: any[]}>(endpoint);
      return response.profiles;
    } catch (error) {
      if (error instanceof Error && error.message.includes('premium_required')) {
        throw new Error('Fonctionnalité Premium requise pour la recherche illimitée');
      }
      throw error;
    }
  }

  // Who likes me functionality
  async getWhoLikesMe(limit: number = 20): Promise<any[]> {
    return apiService.get(`/api/v1/matches/premium/who-likes-me?limit=${limit}`);
  }

  // Utility methods
  formatTimeRemaining(expiresAt: string): string {
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return 'Terminé';

    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  isBoostActive(session: BoostSession): boolean {
    return session.is_active && Date.now() < new Date(session.expires_at).getTime();
  }

  canRewind(availability: RewindAvailability): boolean {
    return availability.can_rewind &&
           availability.expires_at &&
           Date.now() < new Date(availability.expires_at).getTime();
  }
}

export const premiumService = new PremiumService();