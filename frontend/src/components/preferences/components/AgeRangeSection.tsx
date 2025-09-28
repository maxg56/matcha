import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface AgeRangeSectionProps {
  ageMin: number;
  ageMax: number;
  onChange: (min: number, max: number) => void;
}

export function AgeRangeSection({ ageMin, ageMax, onChange }: AgeRangeSectionProps) {
  const handleValueChange = ([min, max]: number[]) => {
    onChange(min, max);
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Tranche d'âge</Label>
      <div className="px-2">
        <Slider
          value={[ageMin, ageMax]}
          onValueChange={handleValueChange}
          min={18}
          max={99}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>{ageMin} ans</span>
          <span>{ageMax} ans</span>
        </div>
      </div>
    </div>
  );
}