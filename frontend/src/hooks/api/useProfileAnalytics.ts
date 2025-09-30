import { useState, useCallback } from 'react';
import { apiService } from '@/services/api';

interface ProfileViewer {
  viewer: {
    id: number;
    username: string;
    first_name: string;
    age: number;
    fame: number;
  };
  viewed_at: string;
}

interface ProfileViewers {
  viewers: ProfileViewer[] | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

interface ProfileViewStats {
  stats: {
    total_views: number;
    unique_viewers: number;
    weekly_views: number;
    daily_views: number;
    last_viewed_at: string | null;
  };
}

interface ViewedProfile {
  profile: {
    id: number;
    username: string;
    first_name: string;
    age: number;
    fame: number;
  };
  viewed_at: string;
}

interface MyProfileViews {
  viewed_profiles: ViewedProfile[] | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export function useProfileAnalytics() {
  const [viewers, setViewers] = useState<ProfileViewer[]>([]);
  const [viewStats, setViewStats] = useState<ProfileViewStats['stats'] | null>(null);
  const [myViews, setMyViews] = useState<ViewedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track a profile view
  const trackProfileView = useCallback(async (profileId: number) => {
    try {
      await apiService.post(`/api/v1/users/profile/${profileId}/view`);
    } catch (err) {
      console.error('Failed to track profile view:', err);
      // Don't throw error for view tracking failures
    }
  }, []);

  // Get users who viewed my profile
  const getProfileViewers = useCallback(async (limit = 20, offset = 0) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.get<ProfileViewers>(
        `/api/v1/users/profile/viewers?limit=${limit}&offset=${offset}`
      );

      if (offset === 0) {
        setViewers(response.viewers || []);
      } else {
        setViewers(prev => [...prev, ...(response.viewers || [])]);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile viewers';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get profile view statistics
  const getProfileViewStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.get<ProfileViewStats>('/api/v1/users/profile/views/stats');
      setViewStats(response.stats);
      return response.stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile view stats';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get profiles I've viewed
  const getMyProfileViews = useCallback(async (limit = 20, offset = 0) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.get<MyProfileViews>(
        `/api/v1/users/profile/views/history?limit=${limit}&offset=${offset}`
      );

      if (offset === 0) {
        setMyViews(response.viewed_profiles || []);
      } else {
        setMyViews(prev => [...prev, ...(response.viewed_profiles || [])]);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch viewed profiles';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    viewers,
    viewStats,
    myViews,
    isLoading,
    error,

    // Actions
    trackProfileView,
    getProfileViewers,
    getProfileViewStats,
    getMyProfileViews,
  };
}