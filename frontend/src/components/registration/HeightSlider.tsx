import { Slider } from '@/components/ui/slider';

interface HeightSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function HeightSlider({
  label,
  value,
  onChange,
  min = 140,
  max = 220,
  step = 1,
  className
}: HeightSliderProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {label}: {value} cm
      </label>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(newValue) => onChange(newValue[0])}
        className="mb-4"
      />
    </div>
  );
}