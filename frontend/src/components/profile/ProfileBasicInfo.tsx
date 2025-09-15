import { Heart, MapPin, Briefcase } from 'lucide-react';
import { genderLabels, preferenceLabels } from './ProfileLabels';
import type { UserProfile } from '@/stores/userStore';

interface ProfileBasicInfoProps {
  user: UserProfile;
}

export function ProfileBasicInfo({ user }: ProfileBasicInfoProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        {user.first_name}, {user.age} ans
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-lg">{genderLabels[user.gender as keyof typeof genderLabels]?.icon}</span>
          <span className="text-sm">{genderLabels[user.gender as keyof typeof genderLabels]?.label}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Heart className="h-4 w-4" />
          <span className="text-sm">Cherche: {preferenceLabels[user.sex_pref as keyof typeof preferenceLabels]}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{user.current_city || 'Non renseigné'}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span className="text-sm">{user.job || 'Non renseigné'}</span>
        </div>
      </div>
    </div>
  );
}