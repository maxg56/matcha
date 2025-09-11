import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] });

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000, // 5 seconds default
      ...toast
    };

    setState(prev => ({
      toasts: [...prev.toasts, newToast]
    }));

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setState(prev => ({
      toasts: prev.toasts.filter(toast => toast.id !== id)
    }));
  }, []);

  const clearAllToasts = useCallback(() => {
    setState({ toasts: [] });
  }, []);

  // Convenience methods
  const success = useCallback((message: string, options?: Partial<Pick<Toast, 'title' | 'duration'>>) => {
    return addToast({ variant: 'success', message, ...options });
  }, [addToast]);

  const error = useCallback((message: string, options?: Partial<Pick<Toast, 'title' | 'duration'>>) => {
    return addToast({ variant: 'error', message, ...options });
  }, [addToast]);

  const warning = useCallback((message: string, options?: Partial<Pick<Toast, 'title' | 'duration'>>) => {
    return addToast({ variant: 'warning', message, ...options });
  }, [addToast]);

  const info = useCallback((message: string, options?: Partial<Pick<Toast, 'title' | 'duration'>>) => {
    return addToast({ variant: 'info', message, ...options });
  }, [addToast]);

  const toast = useCallback((toast: Omit<Toast, 'id'> & { description?: string }) => {
    const { description, ...toastData } = toast;
    return addToast({ 
      ...toastData,
      message: description || toastData.message
    });
  }, [addToast]);

  return {
    toasts: state.toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    toast
  };
}