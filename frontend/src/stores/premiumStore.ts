import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { premiumService, type BoostSession, type RewindAvailability, type PremiumStatus } from '@/services/premiumService';
import { type PlanInterval } from '@/types/pricing';

interface PremiumState {
  // Core state
  isLoading: boolean;
  error: string | null;
  premiumStatus: PremiumStatus | null;

  // Boost state
  currentBoost: BoostSession | null;
  boostTimer: number; // Remaining seconds

  // Rewind state
  rewindAvailability: RewindAvailability | null;

  // UI state
  showBoostModal: boolean;
  showRewindNotification: boolean;
}

interface PremiumActions {
  // Core premium
  checkPremiumStatus: () => Promise<void>;
  upgradeSubscription: (plan: PlanInterval) => Promise<void>;

  // Boost
  startBoost: (type?: 'daily_boost' | 'premium_monthly' | 'super_boost') => Promise<void>;
  checkCurrentBoost: () => Promise<void>;
  updateBoostTimer: (seconds: number) => void;

  // Rewind
  checkRewindAvailability: () => Promise<void>;
  performRewind: () => Promise<void>;

  // UI
  setShowBoostModal: (show: boolean) => void;
  setShowRewindNotification: (show: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

type PremiumStore = PremiumState & PremiumActions;

export const usePremiumStore = create<PremiumStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      isLoading: false,
      error: null,
      premiumStatus: null,
      currentBoost: null,
      boostTimer: 0,
      rewindAvailability: null,
      showBoostModal: false,
      showRewindNotification: false,

      // Core premium
      checkPremiumStatus: async () => {
        set({ isLoading: true, error: null });

        try {
          const premiumStatus = await premiumService.getPremiumStatus();
          set({
            premiumStatus,
            isLoading: false,
            error: null
          });

          // Load additional data if premium
          if (premiumStatus.isPremium) {
            get().checkCurrentBoost();
            get().checkRewindAvailability();
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to check premium status';
          set({
            premiumStatus: null,
            isLoading: false,
            error: errorMessage
          });
        }
      },

      upgradeSubscription: async (plan: PlanInterval) => {
        try {
          const { url } = await premiumService.createCheckoutSession({ plan });
          window.open(url, '_blank');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
          set({ error: errorMessage });
          throw error;
        }
      },

      // Boost
      startBoost: async (type = 'daily_boost') => {
        const premiumStatus = get().premiumStatus;
        if (!premiumStatus?.isPremium && type !== 'daily_boost') {
          throw new Error('Premium required for advanced boost types');
        }

        set({ isLoading: true, error: null });

        try {
          const boost = await premiumService.startBoost(type);
          set({
            currentBoost: boost,
            isLoading: false,
            error: null
          });

          // Start timer
          const remainingTime = new Date(boost.expires_at).getTime() - Date.now();
          get().updateBoostTimer(Math.floor(remainingTime / 1000));

          // Setup timer countdown
          const timer = setInterval(() => {
            const currentTimer = get().boostTimer;
            if (currentTimer <= 0) {
              clearInterval(timer);
              set({ currentBoost: null, boostTimer: 0 });
              return;
            }
            get().updateBoostTimer(currentTimer - 1);
          }, 1000);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to start boost';
          set({
            isLoading: false,
            error: errorMessage
          });
          throw error;
        }
      },

      checkCurrentBoost: async () => {
        try {
          const currentBoost = await premiumService.getCurrentBoost();
          set({ currentBoost });

          if (currentBoost && premiumService.isBoostActive(currentBoost)) {
            const remainingTime = new Date(currentBoost.expires_at).getTime() - Date.now();
            get().updateBoostTimer(Math.floor(remainingTime / 1000));
          }
        } catch (error) {
          console.warn('Failed to check current boost:', error);
        }
      },

      updateBoostTimer: (seconds: number) => {
        set({ boostTimer: Math.max(0, seconds) });
      },

      // Rewind
      checkRewindAvailability: async () => {
        try {
          const availability = await premiumService.getRewindAvailability();
          set({ rewindAvailability: availability });
        } catch (error) {
          console.warn('Failed to check rewind availability:', error);
        }
      },

      performRewind: async () => {
        const premiumStatus = get().premiumStatus;
        if (!premiumStatus?.isPremium) {
          throw new Error('Premium required for rewind feature');
        }

        set({ isLoading: true, error: null });

        try {
          const result = await premiumService.performRewind();

          if (result.success) {
            // Update availability
            await get().checkRewindAvailability();
            set({
              isLoading: false,
              showRewindNotification: true
            });

            // Hide notification after 3 seconds
            setTimeout(() => {
              set({ showRewindNotification: false });
            }, 3000);
          }

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to rewind';
          set({
            isLoading: false,
            error: errorMessage
          });
          throw error;
        }
      },

      // UI Actions
      setShowBoostModal: (show: boolean) => {
        set({ showBoostModal: show });
      },

      setShowRewindNotification: (show: boolean) => {
        set({ showRewindNotification: show });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set({
          isLoading: false,
          error: null,
          premiumStatus: null,
          currentBoost: null,
          boostTimer: 0,
          rewindAvailability: null,
          showBoostModal: false,
          showRewindNotification: false
        });
      }
    }),
    { name: 'PremiumStore' }
  )
);

// Convenience getters
export const useIsPremium = () => usePremiumStore(state => state.premiumStatus?.isPremium || false);
export const useSubscription = () => usePremiumStore(state => state.premiumStatus?.subscription);
export const usePremiumFeatures = () => usePremiumStore(state => state.premiumStatus?.features);

// Legacy compatibility getters for existing code
export const usePremiumStoreLegacy = () => {
  const store = usePremiumStore();
  return {
    ...store,
    isPremium: store.premiumStatus?.isPremium || false,
    subscription: store.premiumStatus?.subscription,
    checkSubscription: store.checkPremiumStatus,
    updateLastSwipeAction: () => {}, // Stub for compatibility
  };
};

// Export types
export type { BoostSession, RewindAvailability, PremiumStatus };