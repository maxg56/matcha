import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FieldOption {
  readonly value: string;
  readonly label: string;
  readonly icon: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly FieldOption[];
  columns?: number;
  error?: string;
  success?: boolean;
  helpText?: string;
  required?: boolean;
  className?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  columns = 2,
  error,
  success = false,
  helpText,
  required = false,
  className
}: SelectFieldProps) {
  const hasError = !!error;
  const hasSuccess = success && !hasError && !!value;
  
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className={cn(
        "grid gap-2",
        columns === 2 ? "grid-cols-2" : "grid-cols-3"
      )}>
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "p-3 rounded-xl border text-sm font-medium transition-all duration-200",
              "flex items-center gap-2 justify-center",
              value === option.value
                ? hasError
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700"
                  : hasSuccess
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
                  : "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            )}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {/* Success or Help Message */}
      {!error && (helpText || hasSuccess) && (
        <div className={cn(
          "flex items-center gap-2 mt-2 p-2 rounded-lg",
          hasSuccess
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
            : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        )}>
          {hasSuccess && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
          <p className={cn(
            "text-sm",
            hasSuccess
              ? "text-green-600 dark:text-green-400"
              : "text-gray-600 dark:text-gray-400"
          )}>
            {hasSuccess ? "Sélection valide ✓" : helpText}
          </p>
        </div>
      )}
    </div>
  );
}