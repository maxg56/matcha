import { Slider } from '@/components/ui/slider';

interface SliderFieldProps {
  field: string;
  label: string;
  min: number;
  max: number;
  unit: string;
  step?: number;
  currentValue: number;
  editingSection: boolean;
  onChange: (field: string, value: number) => void;
}

export function SliderField({
  field,
  label,
  min,
  max,
  unit,
  step = 1,
  currentValue,
  editingSection,
  onChange
}: SliderFieldProps) {
  return (
    <div className="p-4 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground">{label}</h3>
        <span className="text-sm text-muted-foreground">
          {currentValue} {unit}
        </span>
      </div>
      {editingSection ? (
        <Slider
          value={[currentValue]}
          min={min}
          max={max}
          step={step}
          onValueChange={(value) => onChange(field, value[0])}
        />
      ) : (
        <div className="text-foreground">{currentValue} {unit}</div>
      )}
    </div>
  );
}
