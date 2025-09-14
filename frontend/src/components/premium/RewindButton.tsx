import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Crown, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePremiumStore } from '@/stores/premiumStore';

interface RewindButtonProps {
  onUpgrade?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const RewindButton: React.FC<RewindButtonProps> = ({
  onUpgrade,
  className = '',
  size = 'md'
}) => {
  const {
    isPremium,
    rewindAvailability,
    lastSwipeAction,
    showRewindNotification,
    isLoading,
    error,
    performRewind,
    checkRewindAvailability,
    setShowRewindNotification
  } = usePremiumStore();

  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    checkRewindAvailability();
  }, [checkRewindAvailability]);

  // Update timer for rewind window
  useEffect(() => {
    if (rewindAvailability?.rewind_window_remaining_seconds) {
      setTimeRemaining(rewindAvailability.rewind_window_remaining_seconds);

      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            checkRewindAvailability();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [rewindAvailability?.rewind_window_remaining_seconds, checkRewindAvailability]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getActionText = (action: string): string => {
    const actions = {
      like: 'Like',
      pass: 'Pass',
      super_like: 'Super Like',
      block: 'Block'
    };
    return actions[action as keyof typeof actions] || action;
  };

  const handleRewind = async () => {
    try {
      await performRewind();
    } catch (error) {
      console.error('Rewind failed:', error);
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Premium required state
  if (!isPremium) {
    return (
      <div className={`relative ${className}`}>
        <Button
          onClick={onUpgrade}
          variant="outline"
          className={`${sizeClasses[size]} border-purple-300 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 opacity-75`}
          disabled={isLoading}
        >
          <Crown className={`${iconSizes[size]} mr-2`} />
          Rewind
        </Button>
        <Badge
          className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1 py-0.5"
          style={{ fontSize: '0.6rem' }}
        >
          Premium
        </Badge>
      </div>
    );
  }

  // No rewind available
  if (!rewindAvailability?.can_rewind) {
    const reason = rewindAvailability?.reason;
    let tooltipText = 'Aucune action récente à annuler';

    if (reason?.includes('no_rewinds_remaining')) {
      tooltipText = `Plus d'annulations (${rewindAvailability?.remaining_rewinds}/3)`;
    } else if (reason?.includes('rewind_expired')) {
      tooltipText = 'Délai d\'annulation expiré';
    }

    return (
      <div className={`relative group ${className}`}>
        <Button
          variant="outline"
          className={`${sizeClasses[size]} border-gray-300 text-gray-400 cursor-not-allowed opacity-50`}
          disabled
        >
          <RotateCcw className={`${iconSizes[size]} mr-2`} />
          Rewind
        </Button>

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {tooltipText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    );
  }

  // Rewind available
  return (
    <>
      <div className={`relative group ${className}`}>
        <Button
          onClick={handleRewind}
          variant="outline"
          className={`${sizeClasses[size]} border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-400 transition-all`}
          disabled={isLoading}
        >
          <RotateCcw className={`${iconSizes[size]} mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Rewind
          {timeRemaining > 0 && (
            <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
              {formatTime(timeRemaining)}
            </span>
          )}
        </Button>

        {/* Remaining rewinds indicator */}
        {rewindAvailability.remaining_rewinds < 3 && (
          <Badge
            className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5"
            style={{ fontSize: '0.6rem' }}
          >
            {rewindAvailability.remaining_rewinds}
          </Badge>
        )}

        {/* Tooltip with action info */}
        {lastSwipeAction && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Annuler: {getActionText(lastSwipeAction.action)}
            {timeRemaining > 0 && (
              <span className="block text-orange-300">
                <Clock className="w-3 h-3 inline mr-1" />
                {formatTime(timeRemaining)}
              </span>
            )}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        )}
      </div>

      {/* Success notification */}
      {showRewindNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300">
          <CheckCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Action annulée !</p>
            <p className="text-sm opacity-90">Vous pouvez continuer à swiper</p>
          </div>
          <button
            onClick={() => setShowRewindNotification(false)}
            className="ml-2 hover:bg-green-600 rounded-full p-1 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Erreur</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default RewindButton;