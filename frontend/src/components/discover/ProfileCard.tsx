import { useState } from 'react';
import { ProfileImageCarousel } from './ProfileImageCarousel';
import { ProfileInfo } from './ProfileInfo';
import { ProfileActions } from './ProfileActions';
import { ProfileDetails } from './ProfileDetails';

interface Profile {
  id: string | number;
  // Nom (peut venir de first_name ou name)
  name?: string;
  first_name?: string;
  age: number;
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

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  // Normaliser les données pour compatibilité
  const normalizedProfile = {
    ...profile,
    name: profile.name || profile.first_name || 'Utilisateur',
    images: profile.images || profile.profile_photos || [],
    location: profile.location || profile.current_city || '',
    occupation: profile.occupation || profile.job || '',
    interests: profile.interests || profile.tags || [],
    distance: candidate?.distance || profile.distance || 0,
    
    // Normaliser les aliases camelCase vers snake_case
    personalOpinion: profile.personal_opinion || profile.personalOpinion,
    educationLevel: profile.education_level || profile.educationLevel,
    socialActivityLevel: profile.social_activity_level || profile.socialActivityLevel,
    sportActivity: profile.sport_activity || profile.sportActivity,
    childrenStatus: profile.children_status || profile.childrenStatus,
    zodiacSign: profile.zodiac_sign || profile.zodiacSign,
    hairColor: profile.hair_color || profile.hairColor,
    skinColor: profile.skin_color || profile.skinColor,
    eyeColor: profile.eye_color || profile.eyeColor,
    birthCity: profile.birth_city || profile.birthCity,
    currentCity: profile.current_city || profile.currentCity,
    job: profile.job || profile.occupation
  };

  return (
    <div className="relative rounded-2xl overflow-hidden h-full flex flex-col ">
      {/* Carousel d'images */}
      <div className="bg-white dark:bg-gradient-to-b dark:from-gray-800 dark:to-emerald-950">
      <ProfileImageCarousel
        images={normalizedProfile.images}
        profileName={normalizedProfile.name}
        currentIndex={currentImageIndex}
        onImageChange={handleImageChange}
      />
      </div>

      {/* Section infos et boutons */}
      <div className="flex-1 bg-white dark:bg-gradient-to-b dark:from-emerald-950 dark:to-gray-900 flex flex-col">
        {/* Infos profil */}
        <ProfileInfo
          name={normalizedProfile.name}
          age={normalizedProfile.age}
          location={normalizedProfile.location}
          distance={normalizedProfile.distance}
          occupation={normalizedProfile.occupation}
          showDetails={showDetails}
          onToggleDetails={handleToggleDetails}
          candidate={candidate}
        />

        {/* Boutons d'actions */}
        <ProfileActions
          profileId={profile.id}
          onLike={onLike}
          onPass={onPass}
          onSuperLike={onSuperLike}
          onBoost={onBoost}
          onMessage={onMessage}
        />
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
        zodiacSign={normalizedProfile.zodiacSign}
        hairColor={normalizedProfile.hairColor}
        skinColor={normalizedProfile.skinColor}
        eyeColor={normalizedProfile.eyeColor}
        birthCity={normalizedProfile.birthCity}
        currentCity={normalizedProfile.currentCity}
        job={normalizedProfile.job}
        profileId={String(profile.id)}
        isOpen={showDetails}
        onClose={handleCloseDetails}
        onReport={onReport}
      />

    </div>
  );
}