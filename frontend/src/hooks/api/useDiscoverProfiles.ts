import { useEffect, useState } from 'react';
import { useDiscoverStore } from '@/stores/discoverStore';

export function useDiscoverProfiles(initialProfiles = []) {
  // --- STORE MODE ---
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

  // --- MOCK MODE ---
  const [mockIndex, setMockIndex] = useState(0);

  const isMockMode = initialProfiles.length > 0;
  const usedProfiles = isMockMode ? initialProfiles : profiles;
  const currentProfile = usedProfiles[isMockMode ? mockIndex : currentIndex];

  useEffect(() => {
    if (!isMockMode && profiles.length === 0 && !isLoading) {
      fetchProfiles();
    }
  }, [isMockMode, profiles.length, isLoading, fetchProfiles]);

  // Actions adaptées selon le mode
  const handleLike = (id: string | number) => {
    if (isMockMode) {
      console.log('Liked:', id);
      setMockIndex((prev) => prev + 1);
    } else {
      if (typeof id === 'number') {
        likeProfile(id);
      } else {
        console.error('likeProfile expects a number as id');
      }
    }
  };

  const handlePass = (id: string | number) => {
    if (isMockMode) {
      console.log('Passed:', id);
      setMockIndex((prev) => prev + 1);
    } else {
      if (typeof id === 'number') {
        dislikeProfile(id);
      } else {
        console.error('dislikeProfile expects a number as id');
      }
    }
  };

  const handleSuperLike = (id: string | number) => {
    if (isMockMode) {
      console.log('SuperLiked:', id);
      setMockIndex((prev) => prev + 1);
    } else {
      if (typeof id === 'number') {
        superLikeProfile(id);
      } else {
        console.error('superLikeProfile expects a number as id');
      }
    }
  };

  const handleBoost = (id: string | number) => {
    console.log('Boosted:', id);
  };

  const handleMessage = (id: string | number) => {
    console.log('Message:', id);
  };

  const handleReport = (id: string | number, reason: string = 'inappropriate') => {
    if (isMockMode) {
      console.log('Reported:', id, reason);
    } else {
      if (typeof id === 'number') {
        reportProfile(id, reason);
      } else {
        console.error('reportProfile expects a number as id');
      }
    }
  };

  const handleRefresh = () => {
    if (!isMockMode) {
      fetchProfiles();
    } else {
      // En mode mock, on peut juste remettre l'index à 0
      setMockIndex(0);
    }
  };

  return {
    currentProfile,
    hasMoreProfiles: isMockMode ? mockIndex < initialProfiles.length - 1 : hasMoreProfiles,
    isLoading: isMockMode ? false : isLoading,
    error: isMockMode ? null : error,
    actions: {
      onLike: handleLike,
      onPass: handlePass,
      onSuperLike: handleSuperLike,
      onBoost: handleBoost,
      onMessage: handleMessage,
      onReport: handleReport,
      refresh: handleRefresh,
    },
  };
}
