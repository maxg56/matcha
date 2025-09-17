import { Button } from '@/components/ui/button';
import { Shield, User, Eye, MapPin, Heart, Users, Zap, Book, MessageSquare, Star } from 'lucide-react';

interface ProfileDetailsProps {
  bio: string;
  interests: string[];
  personalOpinion?: string;
  educationLevel?: string;
  socialActivityLevel?: string;
  sportActivity?: string;
  religion?: string;
  childrenStatus?: string;
  childrenDetails?: string;
  zodiacSign?: string;
  hairColor?: string;
  skinColor?: string;
  eyeColor?: string;
  birthCity?: string;
  currentCity?: string;
  job?: string;
  relationshipType?: string;
  politicalView?: string;
  alcoholConsumption?: string;
  smoking?: string;
  cannabis?: string;
  drugs?: string;
  pets?: string;
  height?: number;
  fame?: number;
  gender?: string;
  sexPref?: string;
  age?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  isOpen: boolean;
  profileId: string;
  onClose: () => void;
  onReport?: (id: string) => void;
}

export function ProfileDetails({
  bio,
  interests,
  personalOpinion,
  educationLevel,
  socialActivityLevel,
  sportActivity,
  religion,
  childrenStatus,
  childrenDetails,
  zodiacSign,
  hairColor,
  skinColor,
  eyeColor,
  birthCity,
  currentCity,
  job,
  relationshipType,
  politicalView,
  alcoholConsumption,
  smoking,
  cannabis,
  drugs,
  pets,
  height,
  fame,
  gender,
  sexPref,
  age,
  username,
  firstName,
  lastName,
  profileId,
  isOpen,
  onClose,
  onReport
}: ProfileDetailsProps) {
  if (!isOpen) return null;

  // Helper function to format field values
  const formatValue = (value: any, type: 'yes_no' | 'yes_sometimes_no' | 'capitalize' | 'default' = 'default') => {
    if (!value) return null;
    
    switch (type) {
      case 'yes_no':
        return value === 'yes' ? 'Oui' : value === 'no' ? 'Non' : value;
      case 'yes_sometimes_no':
        return value === 'yes' ? 'Oui' : value === 'sometimes' ? 'Parfois' : value === 'no' ? 'Non' : value;
      case 'capitalize':
        return value.charAt(0).toUpperCase() + value.slice(1);
      default:
        return value;
    }
  };

  const renderInfoCard = (icon: string, label: string, value: any, formatType?: 'yes_no' | 'yes_sometimes_no' | 'capitalize') => {
    const formattedValue = formatValue(value, formatType);
    if (!formattedValue) return null;

    return (
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <span>{icon}</span> {label}
        </span>
        <p className="text-gray-900 dark:text-white font-medium">
          {formattedValue}
        </p>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end z-50">
      <div className="w-full bg-white dark:bg-gray-800 rounded-t-3xl p-6 max-h-[90%] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profil détaillé</h2>
            {(firstName || username) && (
              <p className="text-gray-600 dark:text-gray-400">
                {firstName} {lastName && `${lastName}`} {username && `(@${username})`}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {onReport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReport(profileId)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Shield className="h-4 w-4 mr-1" />
                Signaler
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Informations générales */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations générales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderInfoCard("🎂", "Âge", age && `${age} ans`)}
              {renderInfoCard("⚡", "Score Flamme", fame && `${fame}%`)}
              {renderInfoCard("🏷️", "Genre", gender, 'capitalize')}
              {renderInfoCard("💘", "Préférence", sexPref, 'capitalize')}
              {renderInfoCard("📏", "Taille", height && `${height} cm`)}
              {renderInfoCard("💼", "Profession", job, 'capitalize')}
            </div>
          </section>

          {/* Apparence physique */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Apparence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {renderInfoCard("💇", "Cheveux", hairColor, 'capitalize')}
              {renderInfoCard("👁️", "Yeux", eyeColor, 'capitalize')}
              {renderInfoCard("🎨", "Peau", skinColor, 'capitalize')}
              {renderInfoCard("⭐", "Signe", zodiacSign, 'capitalize')}
            </div>
          </section>

          {/* Localisation */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localisation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderInfoCard("🏠", "Ville actuelle", currentCity, 'capitalize')}
              {renderInfoCard("🌍", "Ville de naissance", birthCity, 'capitalize')}
            </div>
          </section>

          {/* Mode de vie */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Mode de vie
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderInfoCard("🍷", "Alcool", alcoholConsumption, 'yes_sometimes_no')}
              {renderInfoCard("🚬", "Tabac", smoking, 'yes_sometimes_no')}
              {renderInfoCard("🌿", "Cannabis", cannabis, 'yes_sometimes_no')}
              {renderInfoCard("💊", "Autres drogues", drugs, 'yes_no')}
              {renderInfoCard("🐕", "Animaux", pets, 'yes_no')}
            </div>
          </section>

          {/* Relations et famille */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Relations et famille
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {renderInfoCard("💑", "Type de relation", relationshipType, 'capitalize')}
              {renderInfoCard("👶", "Enfants", childrenStatus, 'capitalize')}
              {childrenDetails && renderInfoCard("📝", "Détails enfants", childrenDetails)}
            </div>
          </section>

          {/* Activités et loisirs */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Activités et loisirs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderInfoCard("🏃", "Sport", sportActivity, 'capitalize')}
              {renderInfoCard("👥", "Vie sociale", socialActivityLevel, 'capitalize')}
            </div>
          </section>

          {/* Valeurs et croyances */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Book className="h-5 w-5" />
              Valeurs et croyances
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderInfoCard("📚", "Éducation", educationLevel, 'capitalize')}
              {renderInfoCard("🙏", "Religion", religion, 'capitalize')}
              {renderInfoCard("🏛️", "Politique", politicalView, 'capitalize')}
            </div>
          </section>

          {/* Présentation personnelle */}
          {(bio || personalOpinion) && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Présentation
              </h3>
              <div className="space-y-4">
                {bio && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</h4>
                    <p className="text-gray-900 dark:text-white">{bio}</p>
                  </div>
                )}
                {personalOpinion && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Opinion personnelle</h4>
                    <p className="text-gray-900 dark:text-white">{personalOpinion}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Centres d'intérêt */}
          {interests && interests.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Centres d'intérêt
              </h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
