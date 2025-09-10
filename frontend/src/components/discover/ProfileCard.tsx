import { useState } from 'react';
import { ProfileImageCarousel } from './ProfileImageCarousel';
import { ProfileInfo } from './ProfileInfo';
import { ProfileActions } from './ProfileActions';
import { ProfileDetails } from './ProfileDetails';

interface Profile {
  id: string | number;
  name: string;
  age: number;
  images: string[];
  bio: string;
  location: string;
  occupation: string;
  interests: string[];
  distance: number;
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
}

interface ProfileCardProps {
  profile: Profile;
  onLike: (id: string | number) => void;
  onPass: (id: string | number) => void;
  onSuperLike?: (id: string | number) => void;
  onBoost?: (id: string | number) => void;
  onMessage?: (id: string | number) => void;
  onReport?: (id: string | number) => void;
}

export function ProfileCard({
  profile,
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

  return (
    <div className="relative rounded-2xl overflow-hidden h-full flex flex-col ">
      {/* Carousel d'images */}
      <div className="bg-white dark:bg-gradient-to-b dark:from-gray-800 dark:to-emerald-950">
      <ProfileImageCarousel
        images={profile.images}
        profileName={profile.name}
        currentIndex={currentImageIndex}
        onImageChange={handleImageChange}
      />
      </div>

      {/* Section infos et boutons */}
      <div className="flex-1 bg-white dark:bg-gradient-to-b dark:from-emerald-950 dark:to-gray-900 flex flex-col">
        {/* Infos profil */}
        <ProfileInfo
          name={profile.name}
          age={profile.age}
          location={profile.location}
          distance={profile.distance}
          occupation={profile.occupation}
          showDetails={showDetails}
          onToggleDetails={handleToggleDetails}
        />

        {/* Boutons d'actions */}
        <ProfileActions
          profileId={String(profile.id)}
          onLike={onLike}
          onPass={onPass}
          onSuperLike={onSuperLike}
          onBoost={onBoost}
          onMessage={onMessage}
        />
      </div>

      {/* Détails dépliables */}
      <ProfileDetails
        bio={profile.bio}
        interests={profile.interests}
        personalOpinion={profile.personalOpinion}
        educationLevel={profile.educationLevel}
        socialActivityLevel={profile.socialActivityLevel}
        sportActivity={profile.sportActivity}
        religion={profile.religion}
        childrenStatus={profile.childrenStatus}
        zodiacSign={profile.zodiacSign}
        hairColor={profile.hairColor}
        skinColor={profile.skinColor}
        eyeColor={profile.eyeColor}
        birthCity={profile.birthCity}
        currentCity={profile.currentCity}
        job={profile.job}
        profileId={String(profile.id)}
        isOpen={showDetails}
        onClose={handleCloseDetails}
        onReport={onReport}
      />

    </div>
  );
}