import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface FameSectionProps {
  minFame: number;
  onChange: (fame: number) => void;
}

export function FameSection({ minFame, onChange }: FameSectionProps) {
  const handleValueChange = ([fame]: number[]) => {
    onChange(fame);
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Popularité minimale</Label>
      <div className="px-2">
        <Slider
          value={[minFame]}
          onValueChange={handleValueChange}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="text-center text-sm text-muted-foreground mt-1">
          {minFame} points
        </div>
      </div>
    </div>
  );
}