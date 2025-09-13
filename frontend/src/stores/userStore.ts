import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiService } from '@/services/api';
import { useAuthStore } from './authStore';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  sex_pref: string;
  bio?: string;
  location?: string;
  occupation?: string;
  interests: string[];
  images: string[];
  height?: number;
  looking_for?: string;
  age_range_min?: number;
  age_range_max?: number;
  distance_range?: number;
  is_verified?: boolean;
  fame_rating?: number;
  last_seen?: string;
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  fetchProfile: (userId?: number) => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  removeImage: (imageId: string) => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  reset: () => void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  devtools(
    (set) => ({
      profile: null,
      isLoading: false,
      error: null,

      setProfile: (profile) => set({ profile }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
      clearError: () => set({ error: null }),

      fetchProfile: async (userId?: number) => {
        set({ isLoading: true, error: null });
        
        try {
          
          const endpoint = userId ? `/api/v1/users/profile/${userId}` : '/api/v1/users/profile';
          const profile = await apiService.get<UserProfile>(endpoint);
          console.log('Fetched profile:', profile);
          set({
            profile,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
          set({
            profile: null,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      updateProfile: async (profileData: Partial<UserProfile>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Get authenticated user ID for the endpoint
          const currentProfile = useUserStore.getState().profile;
          const authUser = useAuthStore.getState().user;
          const profileId = currentProfile?.id || authUser?.id;
          
          if (!profileId) {
            throw new Error('User ID not found');
          }
          
          const updatedProfile = await apiService.put<UserProfile>(`/api/v1/users/profile/${profileId}`, profileData);
          
          set({
            profile: updatedProfile,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      uploadImage: async (file: File) => {
        set({ isLoading: true, error: null });
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/v1/media/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Upload failed');
          }
          
          const result = await response.json();
          
          const currentProfile = useUserStore.getState().profile;
          if (currentProfile && result.data) {
            // Le service média retourne { data: { url: "...", filename: "..." } }
            const imageUrl = result.data.url;
            const updatedImages = [...currentProfile.images, imageUrl];
            set({
              profile: { ...currentProfile, images: updatedImages },
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      removeImage: async (imageId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiService.delete(`/api/v1/media/delete/${imageId}`);
          
          const currentProfile = useUserStore.getState().profile;
          if (currentProfile) {
            const updatedImages = currentProfile.images.filter(img => !img.includes(imageId));
            set({
              profile: { ...currentProfile, images: updatedImages },
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove image';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      reset: () => {
        set({
          profile: null,
          isLoading: false,
          error: null,
        });
      },
    }),
    { name: 'UserStore' }
  )
);

export type { UserProfile };