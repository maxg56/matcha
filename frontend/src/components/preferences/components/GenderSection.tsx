import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AVAILABLE_GENDERS } from '../constants/genders';

interface GenderSectionProps {
  selectedGenders: string[];
  onChange: (gender: string, checked: boolean) => void;
}

export function GenderSection({ selectedGenders, onChange }: GenderSectionProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Genres préférés</Label>
      <div className="flex flex-wrap gap-3">
        {AVAILABLE_GENDERS.map(gender => (
          <div key={gender.value} className="flex items-center space-x-2">
            <Checkbox
              id={`gender-${gender.value}`}
              checked={selectedGenders.includes(gender.value)}
              onCheckedChange={(checked) => onChange(gender.value, checked as boolean)}
            />
            <Label htmlFor={`gender-${gender.value}`}>{gender.label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}