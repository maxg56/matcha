import { Slider } from '@/components/ui/slider';

interface RangeFilterProps {
  title: string;
  icon: React.ReactNode;
  value: number | [number, number];
  min: number;
  max: number;
  step: number;
  unit?: string;
  onValueChange: (value: number | [number, number]) => void;
}

export function RangeFilter({ 
  title, 
  icon, 
  value, 
  min, 
  max, 
  step, 
  unit = '', 
  onValueChange 
}: RangeFilterProps) {
  const displayValue = Array.isArray(value) 
    ? `${value[0]} - ${value[1]} ${unit}` 
    : `${value} ${unit}`;

  return (
    <div className="mb-6">
      <h4 className="font-medium mb-3 flex items-center gap-2">
        {icon}
        {title}: {displayValue}
      </h4>
      <div className="px-2">
        <Slider
          value={Array.isArray(value) ? value : [value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(newValue) => {
            if (Array.isArray(value)) {
              onValueChange(newValue as [number, number]);
            } else {
              onValueChange(newValue[0]);
            }
          }}
        />
      </div>
    </div>
  );
}