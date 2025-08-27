import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiService } from '@/services/api';

interface Profile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  age: number;
  images: string[];
  bio: string;
  location: string;
  occupation: string;
  interests: string[];
  distance: number;
  fame_rating: number;
  is_online: boolean;
  last_seen: string;
}

interface Match {
  id: number;
  user: Profile;
  matched_at: string;
  is_mutual: boolean;
}

interface LikeAction {
  user_id: number;
  action: 'like' | 'dislike' | 'super_like';
}

interface DiscoverState {
  profiles: Profile[];
  currentIndex: number;
  matches: Match[];
  isLoading: boolean;
  error: string | null;
  hasMoreProfiles: boolean;
}

interface DiscoverActions {
  fetchProfiles: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  likeProfile: (profileId: number) => Promise<void>;
  dislikeProfile: (profileId: number) => Promise<void>;
  superLikeProfile: (profileId: number) => Promise<void>;
  reportProfile: (profileId: number, reason: string) => Promise<void>;
  nextProfile: () => void;
  resetProfiles: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

type DiscoverStore = DiscoverState & DiscoverActions;

export const useDiscoverStore = create<DiscoverStore>()(
  devtools(
    (set, get) => ({
      profiles: [],
      currentIndex: 0,
      matches: [],
      isLoading: false,
      error: null,
      hasMoreProfiles: true,

      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
      clearError: () => set({ error: null }),

      fetchProfiles: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const profiles = await apiService.get<Profile[]>('/api/v1/matches/discover');
          
          set({
            profiles,
            currentIndex: 0,
            hasMoreProfiles: profiles.length > 0,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profiles';
          set({
            profiles: [],
            hasMoreProfiles: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      fetchMatches: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const matches = await apiService.get<Match[]>('/api/v1/matches');
          
          set({
            matches,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch matches';
          set({
            matches: [],
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      likeProfile: async (profileId: number) => {
        
        try {
          const response = await apiService.post<{ is_match: boolean }>('/api/v1/matches/like', {
            user_id: profileId,
            action: 'like'
          });
          
          if (response.is_match) {
            await get().fetchMatches();
          }
          
          get().nextProfile();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to like profile';
          set({ error: errorMessage });
          throw error;
        }
      },

      dislikeProfile: async (profileId: number) => {
        try {
          await apiService.post('/api/v1/matches/like', {
            user_id: profileId,
            action: 'dislike'
          });
          
          get().nextProfile();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to dislike profile';
          set({ error: errorMessage });
          throw error;
        }
      },

      superLikeProfile: async (profileId: number) => {
        
        try {
          const response = await apiService.post<{ is_match: boolean }>('/api/v1/matches/like', {
            user_id: profileId,
            action: 'super_like'
          });
          
          if (response.is_match) {
            await get().fetchMatches();
          }
          
          get().nextProfile();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to super like profile';
          set({ error: errorMessage });
          throw error;
        }
      },

      reportProfile: async (profileId: number, reason: string) => {
        try {
          await apiService.post('/api/v1/users/report', {
            reported_user_id: profileId,
            reason
          });
          
          get().nextProfile();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to report profile';
          set({ error: errorMessage });
          throw error;
        }
      },

      nextProfile: () => {
        const { currentIndex, profiles } = get();
        const nextIndex = currentIndex + 1;
        
        if (nextIndex >= profiles.length) {
          set({ 
            hasMoreProfiles: false,
            currentIndex: profiles.length 
          });
        } else {
          set({ currentIndex: nextIndex });
        }
      },

      resetProfiles: () => {
        set({
          profiles: [],
          currentIndex: 0,
          hasMoreProfiles: true,
          error: null,
        });
      },
    }),
    { name: 'DiscoverStore' }
  )
);

export type { Profile, Match, LikeAction };