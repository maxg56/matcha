import { useState } from 'react';
import { ProfileImageCarousel } from './ProfileImageCarousel';
import { ProfileActions } from './ProfileActions';
import { ProfileDetails } from './ProfileDetails';
import { ProfileContextualOverlay } from './ProfileContextualOverlay';
import { ProfileHeader } from './ProfileHeader';
import { ProfileBio } from './ProfileBio';
import { ProfileInterests } from './ProfileInterests';
import { useProfileAnalytics } from '@/hooks/api/useProfileAnalytics';
import { useNormalizedProfile, getContextualInfo } from '@/hooks/useNormalizedProfile';
import { ChevronDown } from 'lucide-react';

interface Profile {
  id: string | number;
  // Nom (peut venir de first_name ou name)
  name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  age: number;
  height?: number;
  fame?: number;
  gender?: string;
  sex_pref?: string;
  sexPref?: string;
  images?: string[];
  profile_photos?: string[]; // alias pour images
  bio: string;
  location?: string;
  current_city?: string; // source pour location
  occupation?: string;
  job?: string; // source pour occupation
  interests?: string[];
  tags?: string[]; // source pour interests
  distance?: number;
  
  // Infos détaillées
  personal_opinion?: string;
  personalOpinion?: string; // alias
  education_level?: string;
  educationLevel?: string; // alias
  social_activity_level?: string;
  socialActivityLevel?: string; // alias
  sport_activity?: string;
  sportActivity?: string; // alias
  religion?: string;
  children_status?: string;
  childrenStatus?: string; // alias
  children_details?: string;
  childrenDetails?: string; // alias
  zodiac_sign?: string;
  zodiacSign?: string; // alias
  hair_color?: string;
  hairColor?: string; // alias
  skin_color?: string;
  skinColor?: string; // alias
  eye_color?: string;
  eyeColor?: string; // alias
  birth_city?: string;
  birthCity?: string; // alias
  currentCity?: string;
  
  // Style de vie
  relationship_type?: string;
  relationshipType?: string; // alias
  political_view?: string;
  politicalView?: string; // alias
  alcohol_consumption?: string;
  alcoholConsumption?: string; // alias
  smoking?: string;
  cannabis?: string;
  drugs?: string;
  pets?: string;
}

interface ProfileCardProps {
  profile: Profile;
  candidate?: {
    id: number;
    algorithm_type: string;
    compatibility_score?: number;
    distance?: number;
  };
  onLike: (id: string | number) => void;
  onPass: (id: string | number) => void;
  onSuperLike?: (id: string | number) => void;
  onBoost?: (id: string | number) => void;
  onMessage?: (id: string | number) => void;
  onReport?: (id: string | number) => void;
}

export function ProfileCard({
  profile,
  candidate,
  onLike,
  onPass,
  onSuperLike,
  onBoost,
  onMessage,
  onReport
}: ProfileCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const { trackProfileView } = useProfileAnalytics();
  const normalizedProfile = useNormalizedProfile(profile, candidate);

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleToggleDetails = async () => {
    if (!showDetails) {
      await trackProfileView(Number(profile.id));
    }
    setShowDetails(!showDetails);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const currentInfo = getContextualInfo(currentImageIndex, normalizedProfile);

  return (
    <div className="relative rounded-2xl overflow-hidden h-full flex flex-col shadow-2xl">
      {/* Carousel d'images - hauteur responsive : mobile h-80, desktop h-96 */}
      <div className="relative bg-white dark:bg-gradient-to-b dark:from-gray-800 dark:to-emerald-950 h-80 md:h-120 overflow-hidden">
        <ProfileImageCarousel
          images={normalizedProfile.images}
          profileName={normalizedProfile.name}
          currentIndex={currentImageIndex}
          onImageChange={handleImageChange}
        />
        
        <ProfileContextualOverlay
          currentInfo={currentInfo}
          currentImageIndex={currentImageIndex}
          totalImages={normalizedProfile.images.length}
        />
      </div>

      {/* Section infos et boutons */}
      <div className="flex-1 bg-white dark:bg-gradient-to-b dark:from-emerald-950 dark:to-gray-900 flex flex-col min-h-0">
        {/* Header fixe - toujours visible */}
        <div className="flex-shrink-0 p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <ProfileHeader
                name={normalizedProfile.name}
                age={normalizedProfile.age}
              />

              {/* Infos essentielles seulement - localisation */}
              {normalizedProfile.location && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <span>📍</span>
                  <span>
                    {normalizedProfile.location}
                    {normalizedProfile.distance !== undefined && ` • ${Math.round(normalizedProfile.distance)}km`}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleToggleDetails}
              className="ml-4 p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronDown className={`h-5 w-5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Zone scrollable UNIQUE avec toutes les infos */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="px-4 pb-4 flex flex-col h-full">
            {/* Contenu scrollable */}
            <div className="flex-1 space-y-3">
              {/* Infos complémentaires */}
              <div className="space-y-2">
                {normalizedProfile.occupation && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span>💼</span>
                    <span>{normalizedProfile.occupation}</span>
                  </div>
                )}
                {normalizedProfile.educationLevel && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span>🎓</span>
                    <span className="capitalize">{normalizedProfile.educationLevel}</span>
                  </div>
                )}
                {normalizedProfile.childrenStatus && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span>👶</span>
                    <span className="capitalize">
                      {normalizedProfile.childrenStatus === 'yes' ? 'A des enfants' : 'Sans enfants'}
                    </span>
                  </div>
                )}
              </div>

              <ProfileBio bio={normalizedProfile.bio} />
              <ProfileInterests interests={normalizedProfile.interests} />
              
              {/* Boutons DANS le scroll sur desktop seulement */}
              <div className="hidden md:block flex-shrink-0 pt-6">
                <ProfileActions
                  profileId={String(profile.id)}
                  onLike={onLike}
                  onPass={onPass}
                  onSuperLike={onSuperLike}
                  onBoost={onBoost}
                  onMessage={onMessage}
                />
              </div>
              
              {/* Espace pour éviter que le contenu soit caché par les boutons fixes sur mobile */}
              <div className="md:hidden h-20"></div>
            </div>
          </div>
        </div>

        {/* Boutons fixes en bas sur mobile - toujours visibles */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
          <ProfileActions
            profileId={String(profile.id)}
            onLike={onLike}
            onPass={onPass}
            onSuperLike={onSuperLike}
            onBoost={onBoost}
            onMessage={onMessage}
          />
        </div>
      </div>

      {/* Détails dépliables */}
      <ProfileDetails
        bio={normalizedProfile.bio}
        interests={normalizedProfile.interests}
        personalOpinion={normalizedProfile.personalOpinion}
        educationLevel={normalizedProfile.educationLevel}
        socialActivityLevel={normalizedProfile.socialActivityLevel}
        sportActivity={normalizedProfile.sportActivity}
        religion={normalizedProfile.religion}
        childrenStatus={normalizedProfile.childrenStatus}
        childrenDetails={normalizedProfile.childrenDetails}
        zodiacSign={normalizedProfile.zodiacSign}
        hairColor={normalizedProfile.hairColor}
        skinColor={normalizedProfile.skinColor}
        eyeColor={normalizedProfile.eyeColor}
        birthCity={normalizedProfile.birthCity}
        currentCity={normalizedProfile.currentCity}
        job={normalizedProfile.job}
        relationshipType={normalizedProfile.relationshipType}
        politicalView={normalizedProfile.politicalView}
        alcoholConsumption={normalizedProfile.alcoholConsumption}
        smoking={normalizedProfile.smoking}
        cannabis={normalizedProfile.cannabis}
        drugs={normalizedProfile.drugs}
        pets={normalizedProfile.pets}
        height={normalizedProfile.height}
        fame={normalizedProfile.fame}
        gender={normalizedProfile.gender}
        sexPref={normalizedProfile.sexPref}
        age={normalizedProfile.age}
        username={normalizedProfile.username}
        firstName={normalizedProfile.firstName}
        lastName={normalizedProfile.lastName}
        profileId={String(profile.id)}
        isOpen={showDetails}
        onClose={handleCloseDetails}
        onReport={onReport}
      />

    </div>
  );
}