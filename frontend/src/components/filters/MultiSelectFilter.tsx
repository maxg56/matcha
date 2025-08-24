import { cn } from '@/lib/utils';

interface MultiSelectFilterProps {
  options: Array<{value: string, label: string, icon: string}>;
  selectedValues: string[];
  onToggle: (value: string) => void;
}

export function MultiSelectFilter({ options, selectedValues, onToggle }: MultiSelectFilterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onToggle(option.value)}
          className={cn(
            "p-2 md:p-3 rounded-lg border text-xs md:text-sm font-medium transition-all duration-300",
            "flex items-center gap-1 md:gap-2 justify-center shadow-lg",
            selectedValues.includes(option.value)
              ? "bg-purple-500 text-white border-purple-500"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          )}
        >
          <span>{option.icon}</span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}