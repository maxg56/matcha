import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Toast } from '@/hooks/ui/useToast';

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const toastVariants = {
  success: {
    container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    icon: CheckCircle2,
    iconColor: 'text-green-500'
  },
  error: {
    container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    icon: AlertCircle,
    iconColor: 'text-red-500'
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

function ToastItem({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const { container, icon: Icon, iconColor } = toastVariants[toast.variant];

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div className={cn(
      'transform transition-all duration-300 ease-in-out',
      isVisible && !isRemoving
        ? 'translate-x-0 opacity-100'
        : 'translate-x-full opacity-0'
    )}>
      <div className={cn(
        'border rounded-lg p-4 flex items-start gap-3 shadow-lg max-w-sm',
        container
      )}>
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColor)} />
        
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h5 className="font-medium text-sm mb-1">{toast.title}</h5>
          )}
          <div className="text-sm">{toast.message}</div>
        </div>
        
        <button
          onClick={handleRemove}
          className="flex-shrink-0 ml-2 p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}