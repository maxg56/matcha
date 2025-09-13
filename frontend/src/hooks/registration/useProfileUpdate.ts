import { useCallback } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { RegistrationValidator } from '@/utils/registrationValidator';
import type { RegistrationData } from '@/types/registration';

export function useProfileUpdate() {
  const { updateProfile } = useUserStore();
  const { user } = useAuthStore();

  const updateUserProfile = useCallback(async (profileData: RegistrationData) => {
    if (!user?.id) {
      throw new Error('User not found, please login again');
    }

    const profileUpdatePayload = RegistrationValidator.prepareProfilePayload(profileData);
    await updateProfile(profileUpdatePayload);
  }, [updateProfile, user]);

  const updateUserProfileWithImages = useCallback(async (profileData: RegistrationData, _imageUrls: string[]) => {
    if (!user?.id) {
      throw new Error('User not found, please login again');
    }

    const profileUpdatePayload = RegistrationValidator.prepareProfilePayload(profileData);
    
    await updateProfile(profileUpdatePayload);
  }, [updateProfile, user]);

  return {
    updateUserProfile,
    updateUserProfileWithImages,
  };
}