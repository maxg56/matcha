import { Calendar, MapPin, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormData {
  dateOfBirth: string;
  location: string;
  occupation: string;
  bio: string;
}

interface ProfileStepProps {
  formData: Pick<FormData, 'dateOfBirth' | 'location' | 'occupation' | 'bio'>;
  updateFormData: (updates: Partial<FormData>) => void;
}

export function ProfileStep({ formData, updateFormData }: ProfileStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date de naissance</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="dateOfBirth"
            type="date"
            className="pl-10"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Localisation</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="location"
            className="pl-10"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            placeholder="Paris, France"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="occupation">Profession</Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="occupation"
            className="pl-10"
            value={formData.occupation}
            onChange={(e) => updateFormData({ occupation: e.target.value })}
            placeholder="Développeur, Designer..."
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Biographie</Label>
        <Textarea
          id="bio"
          rows={4}
          value={formData.bio}
          onChange={(e) => updateFormData({ bio: e.target.value })}
          placeholder="Parlez-nous de vous, vos passions, ce que vous cherchez..."
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {formData.bio.length}/500 caractères
        </p>
      </div>
    </div>
  );
}