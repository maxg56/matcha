import { createContext, useContext, useState, ReactNode } from 'react';
import { ErrorAlert } from './error-alert';
import { X } from 'lucide-react';

interface GlobalError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  persistent?: boolean;
  context?: string;
}

interface GlobalErrorContextType {
  errors: GlobalError[];
  addError: (message: string, type?: 'error' | 'warning' | 'info', context?: string, persistent?: boolean) => void;
  removeError: (id: string) => void;
  clearAllErrors: () => void;
  clearErrorsByContext: (context: string) => void;
}

const GlobalErrorContext = createContext<GlobalErrorContextType | undefined>(undefined);

export function useGlobalError() {
  const context = useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within GlobalErrorProvider');
  }
  return context;
}

interface GlobalErrorProviderProps {
  children: ReactNode;
}

export function GlobalErrorProvider({ children }: GlobalErrorProviderProps) {
  const [errors, setErrors] = useState<GlobalError[]>([]);

  const addError = (
    message: string, 
    type: 'error' | 'warning' | 'info' = 'error', 
    context?: string,
    persistent = false
  ) => {
    const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newError: GlobalError = {
      id,
      message,
      type,
      context,
      persistent
    };

    setErrors(prev => [...prev, newError]);

    // Auto-remove non-persistent errors after 5 seconds
    if (!persistent) {
      setTimeout(() => {
        removeError(id);
      }, 5000);
    }
  };

  const removeError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearAllErrors = () => {
    setErrors([]);
  };

  const clearErrorsByContext = (context: string) => {
    setErrors(prev => prev.filter(error => error.context !== context));
  };

  const value = {
    errors,
    addError,
    removeError,
    clearAllErrors,
    clearErrorsByContext,
  };

  return (
    <GlobalErrorContext.Provider value={value}>
      {children}
      <GlobalErrorDisplay />
    </GlobalErrorContext.Provider>
  );
}

function GlobalErrorDisplay() {
  const { errors, removeError } = useGlobalError();

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {errors.map(error => (
        <div
          key={error.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <ErrorAlert
            error={error.message}
            variant={error.type === 'error' ? 'destructive' : 'default'}
            className="border-0 rounded-none"
          />
          <button
            onClick={() => removeError(error.id)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Hook utilitaire pour gérer facilement les erreurs API
export function useAPIError() {
  const { addError, clearErrorsByContext } = useGlobalError();

  const handleAPIError = (
    error: unknown, 
    context: string = 'api',
    fallbackMessage: string = 'Une erreur inattendue s\'est produite'
  ) => {
    clearErrorsByContext(context);
    
    const message = error instanceof Error ? error.message : fallbackMessage;
    addError(message, 'error', context, false);
  };

  const showSuccess = (message: string, context?: string) => {
    addError(message, 'info', context, false);
  };

  const showWarning = (message: string, context?: string) => {
    addError(message, 'warning', context, false);
  };

  return {
    handleAPIError,
    showSuccess,
    showWarning,
  };
}