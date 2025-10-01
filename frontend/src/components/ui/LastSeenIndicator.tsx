import React from 'react';
import { Circle } from 'lucide-react';
import { formatLastSeen, getLastSeenColor, isUserOnline } from '@/utils/dateUtils';

interface LastSeenIndicatorProps {
  lastSeen?: string;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LastSeenIndicator({
  lastSeen,
  showIcon = true,
  className = '',
  size = 'md'
}: LastSeenIndicatorProps) {
  const isOnline = isUserOnline(lastSeen);
  const lastSeenText = formatLastSeen(lastSeen);
  const colorClass = getLastSeenColor(lastSeen);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size]} ${className}`}>
      {showIcon && (
        <Circle
          className={`${iconSizes[size]} ${
            isOnline
              ? 'text-green-500 fill-green-500'
              : 'text-gray-400 fill-gray-400'
          }`}
        />
      )}
      <span className={colorClass}>
        {lastSeenText}
      </span>
    </div>
  );
}

interface OnlineStatusProps {
  lastSeen?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Composant simplifié qui affiche uniquement le statut en ligne/hors ligne
 */
export function OnlineStatus({ lastSeen, className = '', size = 'md' }: OnlineStatusProps) {
  const isOnline = isUserOnline(lastSeen);

  const iconSizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <Circle
      className={`${iconSizes[size]} ${className} ${
        isOnline
          ? 'text-green-500 fill-green-500'
          : 'text-gray-400 fill-gray-400'
      }`}
      title={isOnline ? 'En ligne' : 'Hors ligne'}
    />
  );
}