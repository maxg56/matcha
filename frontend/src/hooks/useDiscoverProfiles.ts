import { useEffect } from 'react';
import { useDiscoverStore } from '@/stores/discoverStore';

export function useDiscoverProfiles() {
  const {
    profiles,
    currentIndex,
    hasMoreProfiles,
    isLoading,
    error,
    fetchProfiles,
    likeProfile,
    dislikeProfile,
    superLikeProfile,
    reportProfile,
  } = useDiscoverStore();

  const currentProfile = profiles[currentIndex];

  useEffect(() => {
    if (profiles.length === 0 && !isLoading) {
      fetchProfiles();
    }
  }, [profiles.length, isLoading, fetchProfiles]);

  const handleLike = (id: number) => {
    likeProfile(id);
  };

  const handlePass = (id: number) => {
    dislikeProfile(id);
  };

  const handleSuperLike = (id: number) => {
    superLikeProfile(id);
  };

  const handleBoost = (id: number) => {
    console.log('Boosted:', id);
  };

  const handleMessage = (id: number) => {
    console.log('Message:', id);
  };

  const handleReport = (id: number, reason: string = 'inappropriate') => {
    reportProfile(id, reason);
  };

  return {
    currentProfile,
    hasMoreProfiles,
    isLoading,
    error,
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