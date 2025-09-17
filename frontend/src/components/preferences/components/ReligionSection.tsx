import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RELIGION_OPTIONS, COMMON_RELIGIONS } from '../constants/religions';

interface ReligionSectionProps {
  religionPreference: string;
  blockedReligions: string[];
  onPreferenceChange: (value: string) => void;
  onReligionToggle: (religion: string) => void;
}

export function ReligionSection({
  religionPreference,
  blockedReligions,
  onPreferenceChange,
  onReligionToggle
}: ReligionSectionProps) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Préférences Religieuses</Label>
      <p className="text-sm text-muted-foreground">
        Définissez vos préférences en matière de religion
      </p>

      <div className="space-y-4">
        {/* Type de préférence religieuse */}
        <div className="space-y-2">
          <Label htmlFor="religion">Préférence religieuse</Label>
          <Select
            value={religionPreference}
            onValueChange={onPreferenceChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez..." />
            </SelectTrigger>
            <SelectContent>
              {RELIGION_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Religions bloquées */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Religions à éviter</Label>
          <p className="text-xs text-muted-foreground">
            Sélectionnez les religions que vous souhaitez éviter
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMON_RELIGIONS.map(religion => {
              const isBlocked = blockedReligions.includes(religion);

              return (
                <Badge
                  key={religion}
                  variant={isBlocked ? "destructive" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => onReligionToggle(religion)}
                >
                  {religion}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}