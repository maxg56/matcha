import { cn } from '@/lib/utils';
import { filterOptions } from './FilterOptions';

interface ShowMeFilterProps {
  selectedValue: 'woman' | 'man' | 'both';
  onValueChange: (value: 'woman' | 'man' | 'both') => void;
}

export function ShowMeFilter({ selectedValue, onValueChange }: ShowMeFilterProps) {
  return (
    <div className="mb-6">
      <h4 className="font-medium mb-3">Qui souhaitez-vous voir ?</h4>
      <div className="grid grid-cols-3 gap-2">
        {filterOptions.showMe.map(option => (
          <button
            key={option.value}
            onClick={() => onValueChange(option.value as 'woman' | 'man' | 'both')}
            className={cn(
              "p-3 rounded-lg border text-sm font-medium transition-colors",
              "flex flex-col items-center gap-1",
              selectedValue === option.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-accent"
            )}
          >
            <span className="text-lg">{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}