import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LIFESTYLE_OPTIONS, type LifestyleType } from '../constants/lifestyle';

interface LifestyleSectionProps {
  smokingPreference: string;
  alcoholPreference: string;
  drugsPreference: string;
  cannabisPreference: string;
  onChange: (type: LifestyleType, value: string) => void;
}

export function LifestyleSection({
  smokingPreference,
  alcoholPreference,
  drugsPreference,
  cannabisPreference,
  onChange
}: LifestyleSectionProps) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Préférences de Mode de Vie</Label>
      <p className="text-sm text-muted-foreground">
        Filtrez les profils selon leurs habitudes de vie
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tabac */}
        <div className="space-y-2">
          <Label htmlFor="smoking">Tabac</Label>
          <Select
            value={smokingPreference}
            onValueChange={(value) => onChange('smoking', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez..." />
            </SelectTrigger>
            <SelectContent>
              {LIFESTYLE_OPTIONS.smoking.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Alcool */}
        <div className="space-y-2">
          <Label htmlFor="alcohol">Alcool</Label>
          <Select
            value={alcoholPreference}
            onValueChange={(value) => onChange('alcohol', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez..." />
            </SelectTrigger>
            <SelectContent>
              {LIFESTYLE_OPTIONS.alcohol.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Drogues */}
        <div className="space-y-2">
          <Label htmlFor="drugs">Drogues</Label>
          <Select
            value={drugsPreference}
            onValueChange={(value) => onChange('drugs', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez..." />
            </SelectTrigger>
            <SelectContent>
              {LIFESTYLE_OPTIONS.drugs.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cannabis */}
        <div className="space-y-2">
          <Label htmlFor="cannabis">Cannabis</Label>
          <Select
            value={cannabisPreference}
            onValueChange={(value) => onChange('cannabis', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez..." />
            </SelectTrigger>
            <SelectContent>
              {LIFESTYLE_OPTIONS.cannabis.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}