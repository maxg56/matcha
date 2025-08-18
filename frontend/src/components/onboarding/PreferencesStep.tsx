import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const INTERESTS = [
  'Voyage', 'Photographie', 'Cuisine', 'Sport', 'Musique', 'Art', 
  'Lecture', 'Cinéma', 'Technologie', 'Nature', 'Fitness', 'Danse',
  'Yoga', 'Gaming', 'Mode', 'Design', 'Écriture', 'Théâtre'
];

interface FormData {
  interests: string[];
  ageRange: [number, number];
  maxDistance: number;
  genderPreference: string;
}

interface PreferencesStepProps {
  formData: Pick<FormData, 'interests' | 'ageRange' | 'maxDistance' | 'genderPreference'>;
  updateFormData: (updates: Partial<FormData>) => void;
  toggleInterest: (interest: string) => void;
}

export function PreferencesStep({ formData, updateFormData, toggleInterest }: PreferencesStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Centres d'intérêt</Label>
          <p className="text-sm text-muted-foreground">
            Choisissez au moins 3 centres d'intérêt
          </p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => {
              const isSelected = formData.interests.includes(interest);
              return (
                <Badge
                  key={interest}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    isSelected && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              );
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Je cherche</Label>
            <Select
              value={formData.genderPreference}
              onValueChange={(value) => updateFormData({ genderPreference: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="men">Des hommes</SelectItem>
                <SelectItem value="women">Des femmes</SelectItem>
                <SelectItem value="both">Homme et femmes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Distance max: {formData.maxDistance}km</Label>
            <input
              type="range"
              min="1"
              max="100"
              value={formData.maxDistance}
              onChange={(e) => updateFormData({ maxDistance: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}