import { usePremiumStatus } from '@/components/premium/PremiumIndicator';

// Hook personnalisé pour vérifier facilement si une fonctionnalité est accessible
export function usePremiumAccess() {
  const { isPremium, isLoading } = usePremiumStatus();

  return {
    hasAccess: isPremium,
    isLoading,
    needsUpgrade: !isPremium && !isLoading
  };
}