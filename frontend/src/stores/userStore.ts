import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiService } from '@/services/api';
import { useAuthStore } from './authStore';
import { imageService } from '@/services/imageService';

interface UserProfile {
  id: number;
  username: string;
  email?: string;
  first_name: string;
  last_name?: string;
  birth_date?: string;
  age: number;
  gender: string;
  sex_pref: string;
  bio?: string;
  current_city?: string;
  job?: string;
  interests?: string[];
  images?: string[];
  height?: number;
  alcohol_consumption?: string;
  smoking?: string;
  cannabis?: string;
  drugs?: string;
  pets?: string;
  social_activity_level?: string;
  sport_activity?: string;
  education_level?: string;
  personal_opinion?: string;
  birth_city?: string;
  religion?: string;
  relationship_type?: string;
  children_status?: string;
  zodiac_sign?: string;
  hair_color?: string;
  skin_color?: string;
  eye_color?: string;
  political_view?: string;
  fame?: number;
  tags?: string[];
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
          const response = await apiService.get<{ message?: string, profile: UserProfile }>(endpoint);
          const profile = response.profile;
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
          
          const endpoint = `/api/v1/users/profile/${profileId}`;
          
          const response = await apiService.put<{ message?: string, profile: UserProfile }>(endpoint, profileData);
          
          const updatedProfile = response.profile;
          

          
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
          // Utiliser le service image centralisé
          const result = await imageService.uploadImage(file);

          const currentProfile = useUserStore.getState().profile;
          if (currentProfile && result.data) {
            
            // Le service média retourne { data: { url: "...", filename: "..." } }
            const imageUrl = result.data.url;
            const currentImages = currentProfile.images || [];
            const updatedImages = [...currentImages, imageUrl];
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
          // Utiliser le service image centralisé
          await imageService.deleteImage(imageId);
          
          const currentProfile = useUserStore.getState().profile;
          if (currentProfile) {
            const currentImages = currentProfile.images || [];
            const updatedImages = currentImages.filter(img => !img.includes(imageId));
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