import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscoverStore } from '@/stores/discoverStore';
import { transformToUIProfile } from '@/types/discover';

export function useDiscoverProfiles() {
  const navigate = useNavigate();
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
    blockProfile,
    refreshProfiles,
  } = useDiscoverStore();

  const currentApiProfile = profiles[currentIndex];
  const currentProfile = currentApiProfile ? transformToUIProfile(currentApiProfile) : null;

  useEffect(() => {
    if (profiles.length === 0 && !isLoading) {
      fetchProfiles();
    }
  }, [profiles.length, isLoading, fetchProfiles]);

  const handleLike = async (id: string) => {
    const numId = parseInt(id);
    try {
      await likeProfile(numId);
    } catch (error) {
      console.error('Failed to like profile:', error);
    }
  };

  const handlePass = async (id: string) => {
    const numId = parseInt(id);
    try {
      await dislikeProfile(numId);
    } catch (error) {
      console.error('Failed to pass profile:', error);
    }
  };

  const handleSuperLike = async (id: string) => {
    const numId = parseInt(id);
    try {
      await superLikeProfile(numId);
    } catch (error) {
      console.error('Failed to super like profile:', error);
    }
  };

  const handleBoost = (id: string) => {
    // TODO: Implement boost functionality
    console.log('Boosted profile:', id);
  };

  const handleMessage = (id: string) => {
    const numId = parseInt(id);
    // Navigate to chat page
    navigate(`/app/chat/${numId}`);
  };

  const handleReport = async (id: string, reason: string = 'inappropriate') => {
    const numId = parseInt(id);
    try {
      await reportProfile(numId, reason);
    } catch (error) {
      console.error('Failed to report profile:', error);
    }
  };

  const handleBlock = async (id: string) => {
    const numId = parseInt(id);
    try {
      await blockProfile(numId);
    } catch (error) {
      console.error('Failed to block profile:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshProfiles();
    } catch (error) {
      console.error('Failed to refresh profiles:', error);
    }
  };

  return {
    currentProfile,
    hasMoreProfiles,
    isLoading,
    error,
    refreshProfiles: handleRefresh,
    actions: {
      onLike: handleLike,
      onPass: handlePass,
      onSuperLike: handleSuperLike,
      onBoost: handleBoost,
      onMessage: handleMessage,
      onReport: handleReport,
      onBlock: handleBlock,
    },
  };
}