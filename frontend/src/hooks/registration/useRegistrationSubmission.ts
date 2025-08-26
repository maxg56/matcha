import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { ErrorHandler } from '@/utils/errorHandler';
import { RegistrationValidator } from '@/utils/registrationValidator';
import { useTokenRefresh } from '../auth/useTokenRefresh';
import { useNotifications } from '../ui/useNotifications';
import type { RegistrationData } from '@/types/registration';

export const useRegistrationSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleTokenExpiration } = useTokenRefresh();
  const { dispatchProfileEvent } = useNotifications();

  const submitBasicRegistration = async (formData: RegistrationData) => {
    setIsSubmitting(true);
    
    try {
      const basicPayload = RegistrationValidator.prepareAccountPayload(formData);
      await useAuthStore.getState().register(basicPayload);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'registration');
      throw { fieldErrors, globalError };
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeRegistration = async (formData: RegistrationData) => {
    setIsSubmitting(true);
    
    try {
      const profileUpdatePayload = RegistrationValidator.prepareProfilePayload(formData);
      const currentUser = useAuthStore.getState().user;
      
      if (!currentUser?.id) {
        throw new Error('User not found, please login again');
      }
      
      await useUserStore.getState().updateProfile(profileUpdatePayload);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la finalisation du profil';
      
      // Handle specific errors
      if (errorMessage.includes('failed to update tags')) {
        try {
          const profilePayloadWithoutTags = RegistrationValidator.prepareProfilePayload(formData);
          const { tags: _, ...payloadWithoutTags } = profilePayloadWithoutTags;
          
          await useUserStore.getState().updateProfile(payloadWithoutTags);
          
          window.location.href = '/app/discover';
          dispatchProfileEvent('tags_error', 'Profil créé avec succès ! Les centres d\'intérêt seront ajoutés plus tard.', 'tags_update_failed');
          return true;
        } catch (retryError) {
          console.error('Failed to update profile without tags:', retryError);
        }
        
        dispatchProfileEvent('tags_error', 'Erreur tags - vous pouvez continuer et les modifier plus tard', 'tags_update_failed');
        throw {
          fieldErrors: { tags: 'Impossible de sauvegarder les tags pour le moment' },
          globalError: 'Erreur lors de la mise à jour de vos centres d\'intérêt. Vous pouvez les modifier plus tard dans votre profil.'
        };
      } else if (errorMessage.includes('token expired') || errorMessage.includes('unauthorized')) {
        const success = await handleTokenExpiration(() => completeRegistration(formData));
        if (success) return true;
        
        throw { fieldErrors: {}, globalError: 'Session expirée. Redirection en cours...' };
      } else {
        const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'profile');
        throw { fieldErrors, globalError };
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitBasicRegistration,
    completeRegistration,
  };
};