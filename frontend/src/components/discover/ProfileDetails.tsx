import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface ProfileDetailsProps {
  bio: string;
  interests: string[];
  personalOpinion?: string;
  educationLevel?: string;
  socialActivityLevel?: string;
  sportActivity?: string;
  religion?: string;
  childrenStatus?: string;
  zodiacSign?: string;
  hairColor?: string;
  skinColor?: string;
  eyeColor?: string;
  birthCity?: string;
  currentCity?: string;
  job?: string;
  isOpen: boolean;
  profileId: string;
  onClose: () => void;
  onReport?: (id: string) => void;
}


export function ProfileDetails({
  bio,
  personalOpinion,
  educationLevel,
  socialActivityLevel,
  sportActivity,
  religion,
  childrenStatus,
  zodiacSign,
  hairColor,
  skinColor,
  eyeColor,
  birthCity,
  currentCity,
  job,
  profileId,
  isOpen,
  onClose,
  onReport
}: ProfileDetailsProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end z-50">
      <div className="w-full bg-white dark:bg-gray-800 rounded-t-3xl p-6 max-h-[70%] overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">À propos</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed border-2 border-primary rounded-md pl-4">
              {bio}
            </p>
          </div>

          <div className="space-y-4 border-2 border-primary rounded-md p-4">
            {personalOpinion && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-lg">Opinion personnelle</h3>
                <p className="text-gray-600 dark:text-gray-300">{personalOpinion}</p>
              </div>
            )}

            {educationLevel && (
              <p className="text-gray-700 dark:text-gray-300">🎓 Niveau d'éducation : {educationLevel}</p>
            )}
            {socialActivityLevel && (
              <p className="text-gray-700 dark:text-gray-300">👥 Vie sociale : {socialActivityLevel}</p>
            )}
            {sportActivity && (
              <p className="text-gray-700 dark:text-gray-300">💪 Activité sportive : {sportActivity}</p>
            )}
            {religion && (
              <p className="text-gray-700 dark:text-gray-300">🙏 Religion : {religion}</p>
            )}
            {childrenStatus && (
              <p className="text-gray-700 dark:text-gray-300">👶 Enfants : {childrenStatus}</p>
            )}
            {zodiacSign && (
              <p className="text-gray-700 dark:text-gray-300">♌ Signe astrologique : {zodiacSign}</p>
            )}
            {(hairColor || skinColor || eyeColor) && (
              <p className="text-gray-700 dark:text-gray-300">
                👤 Apparence : {hairColor && `Cheveux ${hairColor}`} {skinColor && `, Peau ${skinColor}`} {eyeColor && `, Yeux ${eyeColor}`}
              </p>
            )}
            {birthCity && (
              <p className="text-gray-700 dark:text-gray-300">🏙️ Ville de naissance : {birthCity}</p>
            )}
            {currentCity && (
              <p className="text-gray-700 dark:text-gray-300">📍 Ville actuelle : {currentCity}</p>
            )}
            {job && (
              <p className="text-gray-700 dark:text-gray-300">💼 Profession : {job}</p>
            )}
          </div>

          {/* Bouton Signaler dans la bio */}
          {onReport && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => onReport(profileId)}
              >
                <Shield className="h-4 w-4" />
                Signaler ce profil
              </Button>
            </div>
          )}

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={onClose}
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}