import { Crown } from 'lucide-react';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function PremiumBadge({ size = 'md', showText = true, className = '' }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full ${className}`}>
      <Crown className={sizeClasses[size]} />
      {showText && (
        <span className={`font-medium ${textSizeClasses[size]}`}>
          Premium
        </span>
      )}
    </div>
  );
}