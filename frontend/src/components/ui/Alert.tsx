import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  className?: string;
  onDismiss?: () => void;
}

const alertVariants = {
  error: {
    container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    icon: AlertCircle,
    iconColor: 'text-red-500'
  },
  success: {
    container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    icon: CheckCircle2,
    iconColor: 'text-green-500'
  },
  warning: {
    container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500'
  },
  info: {
    container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    icon: Info,
    iconColor: 'text-blue-500'
  }
};

export function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  className,
  onDismiss
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  const { container, icon: Icon, iconColor } = alertVariants[variant];
  
  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div className={cn(
      'border rounded-lg p-4 flex items-start gap-3 relative',
      container,
      className
    )}>
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColor)} />
      
      <div className="flex-1 min-w-0">
        {title && (
          <h5 className="font-medium text-sm mb-1">{title}</h5>
        )}
        <div className="text-sm">{children}</div>
      </div>
      
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-2 p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Shortcuts for common alert types
export const ErrorAlert = (props: Omit<AlertProps, 'variant'>) => (
  <Alert variant="error" {...props} />
);

export const SuccessAlert = (props: Omit<AlertProps, 'variant'>) => (
  <Alert variant="success" {...props} />
);

export const WarningAlert = (props: Omit<AlertProps, 'variant'>) => (
  <Alert variant="warning" {...props} />
);

export const InfoAlert = (props: Omit<AlertProps, 'variant'>) => (
  <Alert variant="info" {...props} />
);