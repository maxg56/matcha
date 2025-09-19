import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface DistanceSectionProps {
  maxDistance: number;
  onChange: (distance: number) => void;
}

export function DistanceSection({ maxDistance, onChange }: DistanceSectionProps) {
  const handleValueChange = ([distance]: number[]) => {
    onChange(distance);
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Distance maximale</Label>
      <div className="px-2">
        <Slider
          value={[maxDistance]}
          onValueChange={handleValueChange}
          min={1}
          max={200}
          step={1}
          className="w-full"
        />
        <div className="text-center text-sm text-muted-foreground mt-1">
          {maxDistance} km
        </div>
      </div>
    </div>
  );
}