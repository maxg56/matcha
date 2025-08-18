import { useState } from 'react';
import { ProfileImageCarousel } from './ProfileImageCarousel';
import { ProfileInfo } from './ProfileInfo';
import { ProfileActions } from './ProfileActions';
import { ProfileDetails } from './ProfileDetails';

interface Profile {
  id: string;
  name: string;
  age: number;
  images: string[];
  bio: string;
  location: string;
  occupation: string;
  interests: string[];
  distance: number;
}

interface ProfileCardProps {
  profile: Profile;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  onSuperLike?: (id: string) => void;
  onBoost?: (id: string) => void;
  onMessage?: (id: string) => void;
  onReport?: (id: string) => void;
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
    <div className="relative rounded-b-2xl overflow-hidden h-full flex flex-col">
      {/* Carousel d'images */}
      <ProfileImageCarousel
        images={profile.images}
        profileName={profile.name}
        currentIndex={currentImageIndex}
        onImageChange={handleImageChange}
      />

      {/* Section infos et boutons */}
      <div className="flex-1 bg-white dark:bg-gray-800 flex flex-col">
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
        bio={profile.bio}
        interests={profile.interests}
        profileId={profile.id}
        isOpen={showDetails}
        onClose={handleCloseDetails}
        onReport={onReport}
      />
    </div>
  );
}
