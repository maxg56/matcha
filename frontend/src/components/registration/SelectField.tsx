import { cn } from '@/lib/utils';

interface FieldOption {
  value: string;
  label: string;
  icon: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FieldOption[];
  columns?: number;
  error?: string;
  className?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  columns = 2,
  error,
  className
}: SelectFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {label}
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
              "p-3 rounded-xl border text-sm font-medium transition-colors",
              "flex items-center gap-2 justify-center",
              value === option.value
                ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            )}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
