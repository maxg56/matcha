import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { discoverApi } from '@/services/discover/discoverApi';
import type { 
  DiscoverFilters,
  DiscoverStore,
  LikeResponse
} from '@/types/discover';

export const useDiscoverStore = create<DiscoverStore>()(
  devtools(
    (set, get) => ({
      profiles: [],
      currentIndex: 0,
      matches: [],
      isLoading: false,
      error: null,
      hasMoreProfiles: true,
      filters: {},

      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
      clearError: () => set({ error: null }),

      fetchProfiles: async (filters?: DiscoverFilters) => {
        set({ isLoading: true, error: null });
        
        try {
          const filtersToUse = filters || get().filters;
          const profiles = await discoverApi.fetchDiscoverProfiles(filtersToUse);
          
          set({
            profiles,
            currentIndex: 0,
            hasMoreProfiles: profiles.length > 0,
            isLoading: false,
            error: null,
            filters: filtersToUse,
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

      refreshProfiles: async () => {
        await get().fetchProfiles(get().filters);
      },

      fetchMatches: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const matches = await discoverApi.fetchMatches();
          
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
          const response: LikeResponse = await discoverApi.likeProfile(profileId);
          
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
          await discoverApi.passProfile(profileId);
          
          get().nextProfile();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to pass profile';
          set({ error: errorMessage });
          throw error;
        }
      },

      superLikeProfile: async (profileId: number) => {
        try {
          const response: LikeResponse = await discoverApi.superLikeProfile(profileId);
          
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
          await discoverApi.reportProfile(profileId, reason);
          
          get().nextProfile();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to report profile';
          set({ error: errorMessage });
          throw error;
        }
      },

      blockProfile: async (profileId: number) => {
        try {
          await discoverApi.blockProfile(profileId);
          
          get().nextProfile();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to block profile';
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
          
          // Auto-fetch more profiles when running low
          if (profiles.length > 0) {
            get().fetchProfiles().catch(console.error);
          }
        } else {
          set({ currentIndex: nextIndex });
        }
      },

      goToProfile: (index: number) => {
        const { profiles } = get();
        if (index >= 0 && index < profiles.length) {
          set({ currentIndex: index });
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

      updateFilters: (newFilters: Partial<DiscoverFilters>) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters });
      },

      clearFilters: () => {
        set({ filters: {} });
      },
    }),
    { name: 'DiscoverStore' }
  )
);

export type { DiscoverProfile, Match, DiscoverFilters, LikeResponse } from '@/types/discover';