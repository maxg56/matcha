import { Heart, MapPin, Briefcase } from 'lucide-react';
import { genderLabels, preferenceLabels } from './ProfileLabels';

interface ProfileBasicInfoProps {
  user: {
    name: string;
    age: number;
    gender: string;
    sexualPreference: string;
    currentCity: string;
    occupation: string;
  };
}

export function ProfileBasicInfo({ user }: ProfileBasicInfoProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        {user.name}, {user.age} ans
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-lg">{genderLabels[user.gender as keyof typeof genderLabels]?.icon}</span>
          <span className="text-sm">{genderLabels[user.gender as keyof typeof genderLabels]?.label}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Heart className="h-4 w-4" />
          <span className="text-sm">Cherche: {preferenceLabels[user.sexualPreference as keyof typeof preferenceLabels]}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{user.currentCity}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span className="text-sm">{user.occupation}</span>
        </div>
      </div>
    </div>
  );
}