import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';

interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
  className?: string;
}

export function Slider({ 
  value, 
  defaultValue = [50], 
  min = 0, 
  max = 100, 
  step = 1,
  onValueChange,
  disabled = false,
  className 
}: SliderProps) {
  const [sliderValue, setSliderValue] = useState(value || defaultValue);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newValue = [parseInt(event.target.value)];
    setSliderValue(newValue);
    onValueChange?.(newValue);
  }, [disabled, onValueChange]);

  const currentValue = value || sliderValue;

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue[0]}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer",
          "slider-thumb:appearance-none slider-thumb:w-5 slider-thumb:h-5",
          "slider-thumb:rounded-full slider-thumb:bg-primary slider-thumb:cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          // Custom styles for webkit browsers
          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer",
          "[&::-webkit-slider-track]:bg-muted [&::-webkit-slider-track]:rounded-lg [&::-webkit-slider-track]:h-2",
          // Custom styles for Firefox
          "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none",
          "[&::-moz-range-track]:bg-muted [&::-moz-range-track]:rounded-lg [&::-moz-range-track]:h-2"
        )}
      />
    </div>
  );
}