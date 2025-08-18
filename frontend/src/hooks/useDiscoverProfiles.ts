import { useState } from 'react';

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

export function useDiscoverProfiles(initialProfiles: Profile[]) {
  const [profiles] = useState(initialProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentProfile = profiles[currentIndex];
  const hasMoreProfiles = currentIndex < profiles.length - 1;

  const nextProfile = () => {
    if (hasMoreProfiles) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Reset pour la demo
    }
  };

  const handleLike = (id: string) => {
    console.log('Liked:', id);
    nextProfile();
  };

  const handlePass = (id: string) => {
    console.log('Passed:', id);
    nextProfile();
  };

  const handleSuperLike = (id: string) => {
    console.log('Super liked:', id);
    nextProfile();
  };

  const handleBoost = (id: string) => {
    console.log('Boosted:', id);
  };

  const handleMessage = (id: string) => {
    console.log('Message:', id);
  };

  const handleReport = (id: string) => {
    console.log('Report:', id);
  };

  return {
    currentProfile,
    hasMoreProfiles,
    actions: {
      onLike: handleLike,
      onPass: handlePass,
      onSuperLike: handleSuperLike,
      onBoost: handleBoost,
      onMessage: handleMessage,
      onReport: handleReport,
    },
  };
}
