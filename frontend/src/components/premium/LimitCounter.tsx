import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Zap, AlertTriangle, Clock } from 'lucide-react';

interface LimitCounterProps {
  current: number;
  limit: number;
  type: 'swipes' | 'likes' | 'super-likes' | 'boosts';
  onUpgrade?: () => void;
  resetTime?: Date; // Quand la limite se remet à zéro
  className?: string;
}

const limitConfig = {
  swipes: {
    icon: <Zap className="w-4 h-4" />,
    name: 'Swipes',
    unit: 'swipes',
    warningThreshold: 0.8,
    criticalThreshold: 0.95,
    frustrationMessages: [
      "Plus que quelques swipes !",
      "Attention, tu arrives à la limite !",
      "Derniers swipes de la journée !",
      "Limite atteinte ! 😤"
    ]
  },
  likes: {
    icon: <Zap className="w-4 h-4" />,
    name: 'Likes',
    unit: 'likes',
    warningThreshold: 0.8,
    criticalThreshold: 0.95,
    frustrationMessages: [
      "Plus que quelques likes !",
      "Tu approches de la limite !",
      "Derniers likes disponibles !",
      "Plus de likes ! 😩"
    ]
  },
  'super-likes': {
    icon: <Crown className="w-4 h-4" />,
    name: 'Super Likes',
    unit: 'super likes',
    warningThreshold: 0.6,
    criticalThreshold: 0.8,
    frustrationMessages: [
      "Plus que quelques Super Likes !",
      "Attention aux Super Likes restants !",
      "Derniers Super Likes !",
      "Plus de Super Likes ! 💔"
    ]
  },
  boosts: {
    icon: <Crown className="w-4 h-4" />,
    name: 'Boosts',
    unit: 'boosts',
    warningThreshold: 0.5,
    criticalThreshold: 1,
    frustrationMessages: [
      "Plus de boost disponible !",
      "Plus de boost disponible !",
      "Plus de boost disponible !",
      "Plus de boost ! 😢"
    ]
  }
};

const LimitCounter: React.FC<LimitCounterProps> = ({
  current,
  limit,
  type,
  onUpgrade,
  resetTime,
  className = ''
}) => {
  const config = limitConfig[type];
  const percentage = (current / limit) * 100;
  const remaining = limit - current;
  const isNearLimit = percentage >= config.warningThreshold * 100;
  const isCritical = percentage >= config.criticalThreshold * 100;
  const isExhausted = current >= limit;

  // Message de frustration basé sur le pourcentage
  const getFrustrationMessage = (): string => {
    if (isExhausted) return config.frustrationMessages[3];
    if (isCritical) return config.frustrationMessages[2];
    if (isNearLimit) return config.frustrationMessages[1];
    return config.frustrationMessages[0];
  };

  // Couleur de la progress bar
  const getProgressColor = () => {
    if (isExhausted) return 'bg-red-500';
    if (isCritical) return 'bg-orange-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Temps jusqu'au reset
  const getTimeUntilReset = (): string => {
    if (!resetTime) return '';

    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();

    if (diff <= 0) return '';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className="font-medium text-sm">{config.name}</span>
        </div>

        <div className="flex items-center gap-1 text-sm">
          <span className={`font-bold ${isExhausted ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
            {remaining}
          </span>
          <span className="text-gray-500">/ {limit}</span>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {/* Message de frustration */}
        {(isNearLimit || isExhausted) && (
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${isExhausted ? 'text-red-500' : 'text-orange-500'}`} />
            <span className={`text-sm font-medium ${isExhausted ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {getFrustrationMessage()}
            </span>
          </div>
        )}
      </div>

      {/* Section Premium */}
      {(isNearLimit || isExhausted) && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              Premium
            </span>
          </div>

          <p className="text-xs text-purple-600 dark:text-purple-400 mb-3">
            {type === 'swipes' && "Swipes illimités tous les jours"}
            {type === 'likes' && "Likes illimités tous les jours"}
            {type === 'super-likes' && "Super Likes illimités"}
            {type === 'boosts' && "Boosts mensuels inclus"}
          </p>

          <Button
            onClick={onUpgrade}
            size="sm"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-8 text-xs"
          >
            <Crown className="w-3 h-3 mr-1" />
            Passer au Premium
          </Button>
        </div>
      )}

      {/* Temps jusqu'au reset */}
      {resetTime && !isExhausted && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
          <Clock className="w-3 h-3" />
          <span>Reset dans {getTimeUntilReset()}</span>
        </div>
      )}

      {/* Message pour les utilisateurs qui ont épuisé leur limite */}
      {isExhausted && resetTime && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mt-3 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <div>
              <p className="text-sm font-medium">Limite atteinte !</p>
              <p className="text-xs">Reset dans {getTimeUntilReset()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LimitCounter;