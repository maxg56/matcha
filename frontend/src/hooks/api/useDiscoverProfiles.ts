import { useEffect, useState } from 'react';

export function useDiscoverProfiles(initialProfiles = []) {
  // --- MOCK MODE (PRIMARY) ---
  const [mockIndex, setMockIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isMockMode = initialProfiles.length > 0;
  const usedProfiles = isMockMode ? initialProfiles : [];
  const currentProfile = usedProfiles[mockIndex];

  // For future API integration
  useEffect(() => {
    if (!isMockMode) {
      // TODO: Implement API profile fetching when discoverStore is available
      setIsLoading(false);
    }
  }, [isMockMode]);

  // Actions adaptées selon le mode
  const handleLike = (id: string | number) => {
    if (isMockMode) {
      setMockIndex((prev) => prev + 1);
    } else {
      // TODO: Implement API like when discoverStore is available
      console.log('Like profile:', id);
    }
  };

  const handlePass = (id: string | number) => {
    if (isMockMode) {
      setMockIndex((prev) => prev + 1);
    } else {
      // TODO: Implement API dislike when discoverStore is available
      console.log('Pass profile:', id);
    }
  };

  const handleSuperLike = (id: string | number) => {
    if (isMockMode) {
      setMockIndex((prev) => prev + 1);
    } else {
      // TODO: Implement API super like when discoverStore is available
      console.log('Super like profile:', id);
    }
  };

  const handleBoost = (_id: string | number) => {
    // TODO: Implement boost functionality
    console.log('Boost profile:', _id);
  };

  const handleMessage = (_id: string | number) => {
    // TODO: Implement message functionality
    console.log('Message profile:', _id);
  };

  const handleReport = (id: string | number, reason: string = 'inappropriate') => {
    if (isMockMode) {
      // TODO: Implement report functionality
      console.log('Report profile:', id, 'Reason:', reason);
    } else {
      // TODO: Implement API report when discoverStore is available
      console.log('Report profile:', id, 'Reason:', reason);
    }
  };

  const handleRefresh = () => {
    if (!isMockMode) {
      // TODO: Implement API refresh when discoverStore is available
      console.log('Refresh profiles');
    } else {
      // En mode mock, on peut juste remettre l'index à 0
      setMockIndex(0);
    }
  };

  return {
    currentProfile,
    hasMoreProfiles: isMockMode ? mockIndex < initialProfiles.length - 1 : false,
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
