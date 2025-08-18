import { cn } from '@/lib/utils';

interface SelectFieldProps {
  field: string;
  options: Array<{value: string, label: string, icon: string}>;
  label: string;
  currentValue: string;
  editable?: boolean;
  editingSection: boolean;
  onChange: (field: string, value: string) => void;
}

export function SelectField({
  field,
  options,
  label,
  currentValue,
  editable = true,
  editingSection,
  onChange
}: SelectFieldProps) {
  const currentOption = options.find(opt => opt.value === currentValue);

  return (
    <div className="p-4 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-foreground">{label}</h3>
        {!editable && currentOption && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{currentOption.icon}</span>
            <span>{currentOption.label}</span>
          </div>
        )}
      </div>

      {editable && editingSection && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => onChange(field, option.value)}
              className={cn(
                "p-2 rounded-lg border text-xs font-medium transition-colors",
                "flex items-center gap-1 justify-center",
                currentValue === option.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-accent"
              )}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {(!editable || !editingSection) && currentOption && (
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentOption.icon}</span>
          <span className="text-foreground">{currentOption.label}</span>
        </div>
      )}
    </div>
  );
}
