import React from 'react';
import { Crown, Star, Zap } from 'lucide-react';

interface PremiumIndicatorProps {
  variant?: 'badge' | 'crown' | 'banner' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function PremiumIndicator({
  variant = 'badge',
  size = 'md',
  animated = true,
  className = ''
}: PremiumIndicatorProps) {
  const baseClasses = "inline-flex items-center gap-1 font-semibold";

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  const animationClasses = animated ? "animate-pulse" : "";

  switch (variant) {
    case 'crown':
      return (
        <div className={`${baseClasses} ${sizeClasses[size]} ${animationClasses} ${className}`}>
          <Crown className="h-4 w-4 text-yellow-400" />
          <span className="bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
            VIP
          </span>
        </div>
      );

    case 'banner':
      return (
        <div className={`${baseClasses} bg-gradient-to-r from-yellow-500 to-purple-600 text-white rounded-full ${sizeClasses[size]} ${animationClasses} ${className}`}>
          <Star className="h-4 w-4" />
          <span>PREMIUM</span>
          <Zap className="h-4 w-4" />
        </div>
      );

    case 'subtle':
      return (
        <div className={`${baseClasses} text-purple-600 dark:text-purple-400 ${sizeClasses[size]} ${animationClasses} ${className}`}>
          <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-purple-400 rounded-full"></div>
          <span>Premium</span>
        </div>
      );

    default: // badge
      return (
        <div className={`${baseClasses} bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg ${sizeClasses[size]} ${animationClasses} ${className}`}>
          <Star className="h-4 w-4" />
          <span>Premium</span>
        </div>
      );
  }
}

// Hook pour utiliser le statut premium dans d'autres composants
// eslint-disable-next-line react-refresh/only-export-components
export function usePremiumStatus() {
  const [isPremium, setIsPremium] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const { subscriptionService } = await import('@/services/subscriptionService');
        const premium = await subscriptionService.isPremiumUser();
        setIsPremium(premium);
      } catch (error) {
        console.error('Erreur lors de la vérification du statut premium:', error);
        setIsPremium(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPremiumStatus();
  }, []);

  return { isPremium, isLoading };
}