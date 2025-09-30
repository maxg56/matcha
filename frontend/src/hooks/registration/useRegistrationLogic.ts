import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistrationStore } from '@/stores/registrationStore';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { RegistrationValidator } from '@/utils/registrationValidator';
import { authService } from '@/services/auth';
import { ErrorHandler } from '@/utils/errorHandler';
import { apiService } from '@/services/api';
import { imageService } from '@/services/imageService';
import { useRegistrationErrors } from '../useRegistrationErrors';

/**
 * Hook contenant toute la logique métier pour l'inscription
 * Le store ne contient que l'état, ce hook contient les algorithmes
 */
export function useRegistrationLogic() {
  const navigate = useNavigate();
  const { handleCriticalError, showSuccess } = useRegistrationErrors();
  const {
    formData,
    currentStep,
    isEmailVerified,
    isAccountCreated,
    selectedImages,
    emailVerificationCode,
    setCurrentStep,
    setErrors,
    setGlobalError,
    clearGlobalError,
    setLoading,
    setSubmitting,
    setEmailVerified,
    setAccountCreated,
  } = useRegistrationStore();

  // === VALIDATION ===
  const validateCurrentStep = useCallback((): boolean => {
    const newErrors = RegistrationValidator.validateStep(currentStep, formData, isEmailVerified);
    
    // Special validation for image upload step
    if (currentStep === 9 && selectedImages.length === 0) {
      newErrors.images = 'Au moins une image est requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData, isEmailVerified, selectedImages.length, setErrors]);

  const canContinue = useCallback((): boolean => {
    // Special validation for image upload step
    if (currentStep === 9) {
      return selectedImages.length > 0; // At least one image required
    }
    return RegistrationValidator.canContinueStep(currentStep, formData, isEmailVerified);
  }, [currentStep, formData, isEmailVerified, selectedImages.length]);

  // === NAVIGATION AVEC LOGIQUE ===
  const nextStep = useCallback(async () => {
    if (validateCurrentStep()) {
      clearGlobalError();
      
      // Si on passe de l'étape 1 à l'étape 2 et que le compte n'est pas encore créé
      if (currentStep === 1 && !isAccountCreated) {
        await submitRegistration();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  }, [currentStep, isAccountCreated, validateCurrentStep, clearGlobalError, setCurrentStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(Math.max(currentStep - 1, 1));
    setErrors({});
    clearGlobalError();
  }, [currentStep, setCurrentStep, setErrors, clearGlobalError]);

  // === EMAIL VERIFICATION ===
  const sendEmailVerification = useCallback(async () => {
    setLoading(true);
    clearGlobalError();
    
    try {
      await authService.sendEmailVerification(formData.email);
      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du code';
      const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'registration');

      setErrors({ ...fieldErrors });
      setGlobalError(globalError || 'Erreur lors de l\'envoi du code de vérification');

      // Show critical error toast for sending email verification
      handleCriticalError(error instanceof Error ? error : new Error(String(error)), 'email_verification');

      setLoading(false);
      throw error;
    }
  }, [formData.email, setLoading, clearGlobalError, setErrors, setGlobalError, handleCriticalError]);

  const verifyEmail = useCallback(async () => {
    setLoading(true);
    clearGlobalError();
    
    try {
      await authService.verifyEmail(formData.email, emailVerificationCode);
      
      // Vérifier l'authentification après la vérification d'email
      try {
        await useAuthStore.getState().checkAuth();
      } catch (authError) {
        console.warn('Failed to refresh auth state after email verification:', authError);
      }
      
      setEmailVerified(true);
      setCurrentStep(3);
      setErrors({});
      setLoading(false);

      // Show success message
      showSuccess('✅ Email vérifié', 'Votre email a été vérifié avec succès');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Code de vérification invalide';
      const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'registration');

      setErrors({ ...fieldErrors });
      setGlobalError(globalError || 'Code de vérification invalide');

      // Show critical error toast for email verification
      handleCriticalError(error instanceof Error ? error : new Error(String(error)), 'email_verification');

      setLoading(false);
      throw error;
    }
  }, [formData.email, emailVerificationCode, setLoading, clearGlobalError, setEmailVerified, setCurrentStep, setErrors, setGlobalError, showSuccess, handleCriticalError]);

  // === REGISTRATION PROCESS ===
  const submitRegistration = useCallback(async () => {
    setSubmitting(true);
    setLoading(true);
    clearGlobalError();
    
    try {
      if (currentStep === 1) {
        const basicPayload = RegistrationValidator.prepareAccountPayload(formData);
        await useAuthStore.getState().register(basicPayload);
        
        // Envoyer automatiquement l'email de vérification après la création du compte
        try {
          await authService.sendEmailVerification(formData.email);
        } catch (emailError) {
          console.warn('Failed to send verification email automatically:', emailError);
          // Continue même si l'email échoue, l'utilisateur pourra le redemander
        }
        
        setAccountCreated(true);
        setCurrentStep(2);
        setSubmitting(false);
        setLoading(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'registration');
      
      setErrors(fieldErrors);
      setGlobalError(globalError);
      setSubmitting(false);
      setLoading(false);
      throw error;
    }
  }, [currentStep, formData, setSubmitting, setLoading, clearGlobalError, setAccountCreated, setCurrentStep, setErrors, setGlobalError]);

  const completeRegistration = useCallback(async () => {
    if (!isAccountCreated) {
      throw new Error('Account must be created first');
    }
    
    // Vérifier qu'au moins une image est présente (obligatoire)
    if (selectedImages.length === 0) {
      setGlobalError('Au moins une image est requise pour finaliser votre profil');
      throw new Error('Au moins une image est requise pour finaliser votre profil');
    }
    
    setSubmitting(true);
    setLoading(true);
    clearGlobalError();
    
    try {
      // 0. Vérifier l'authentification avant de commencer
      try {
        console.log('Checking auth state before profile completion...');
        await useAuthStore.getState().checkAuth();
        
        // Si checkAuth réussit, vérifier quand même l'état
        const authState = useAuthStore.getState();
        if (!authState.isAuthenticated || !authState.user?.id) {
          throw new Error('Not authenticated after auth check');
        }
        
        console.log('Auth check successful:', {
          userId: authState.user.id,
          isAuthenticated: authState.isAuthenticated
        });
      } catch (authError) {
        console.error('Auth check failed:', authError);
        
        // Essayer de se reconnecter automatiquement avec les credentials stockés
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          try {
            console.log('Attempting to refresh token...');
            // Utiliser le service API centralisé pour le refresh token
            const tokenData = await apiService.post<{
              access_token: string;
              refresh_token: string;
            }>('/api/v1/auth/refresh', { refresh_token: refreshToken });

            authService.setTokens(tokenData.access_token, tokenData.refresh_token);

            // Recheck auth after refresh
            await useAuthStore.getState().checkAuth();
            console.log('Token refresh successful');
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            throw new Error('Authentication expired. Please login again.');
          }
        } else {
          throw new Error('No refresh token available. Please login again.');
        }
      }

      // 1. Upload des images depuis le store
      let imageUrls: string[] = [];
      const uploadPromises = selectedImages.map(async (imagePreview) => {
        try {
          const result = await imageService.uploadImage(imagePreview.file);
          return result.data.url;
        } catch (error) {
          // Show toast for image upload error
          handleCriticalError(error instanceof Error ? error : new Error(String(error)), 'image_upload');
          throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
      
      imageUrls = await Promise.all(uploadPromises);

      // 2. Préparer les données de profil à partir du formulaire d'inscription
      const profileUpdatePayload = RegistrationValidator.prepareProfilePayload(formData);
      
      // 3. Ajouter les URLs des images uploadées (obligatoires)
      profileUpdatePayload.images = imageUrls;

      // 4. Vérifier l'authentification avant de mettre à jour le profil
      const authState = useAuthStore.getState();
      const currentUser = authState.user;
      const isAuthenticated = authState.isAuthenticated;
      
      console.log('Auth state before profile update:', {
        user: currentUser,
        isAuthenticated,
        hasToken: !!authService.getAccessToken(),
        hasRefreshToken: !!authService.getRefreshToken()
      });
      
      if (!currentUser?.id || !isAuthenticated) {
        console.error('Authentication failed:', { currentUser, isAuthenticated });
        throw new Error('User not found or not authenticated, please login again');
      }

      // Vérifier que le token est valide
      const token = authService.getAccessToken();
      if (!token) {
        console.error('No access token found');
        throw new Error('Authentication token not found, please login again');
      }

      console.log('Attempting to update profile with payload:', profileUpdatePayload);
      await useUserStore.getState().updateProfile(profileUpdatePayload);
      
      // 5. Succès - rediriger vers la page de découverte
      setSubmitting(false);
      setLoading(false);

      // Show success message
      showSuccess('🎉 Profil créé avec succès', 'Bienvenue sur Matcha ! Découvrez dès maintenant des profils compatibles.');

      navigate('/app/discover');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la finalisation du profil';
      
      // Gestion des erreurs spécifiques
      if (errorMessage.includes('user not authenticated') || errorMessage.includes('not authenticated')) {
        // Clear tokens and redirect to login
        authService.clearTokens();
        useAuthStore.getState().logout();
        
        setErrors({ images: 'Session expirée. Veuillez vous reconnecter et reprendre l\'inscription.' });
        setGlobalError('Votre session a expiré. Veuillez vous reconnecter.');
        setSubmitting(false);
        setLoading(false);
        navigate('/app/profile');
        return;
      }
      
      if (errorMessage.includes('failed to update tags')) {
        // Try to update profile without tags first, then handle tags separately
        try {
          const profilePayloadWithoutTags = RegistrationValidator.prepareProfilePayload(formData);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { tags: _ignoredTags, ...payloadWithoutTags } = profilePayloadWithoutTags;
          
          await useUserStore.getState().updateProfile(payloadWithoutTags);
          
          // Profile updated successfully without tags, continue to discover page
          navigate('/app/discover');
          return;
        } catch (retryError) {
          console.error('Failed to update profile without tags:', retryError);
        }
      } 
      
      if (errorMessage.includes('token expired') || errorMessage.includes('unauthorized')) {
        // Clear tokens and redirect to login
        authService.clearTokens();
        
        setErrors({ images: 'Session expirée. Veuillez vous reconnecter.' });
        setGlobalError('Session expirée. Redirection en cours...');
        setLoading(false);
        setSubmitting(false);
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        
        throw new Error('token expired');
      }
      
      // Autres erreurs
      const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'profile');

      setErrors(fieldErrors);
      setGlobalError(globalError);

      // Show critical error toast for profile completion
      handleCriticalError(error instanceof Error ? error : new Error(String(error)), 'profile_completion');

      setSubmitting(false);
      setLoading(false);

      throw error;
    }
  }, [isAccountCreated, selectedImages, formData, setSubmitting, setLoading, clearGlobalError, setGlobalError, setErrors, handleCriticalError, showSuccess, navigate]);

  return {
    // Validation
    validateCurrentStep,
    canContinue,
    
    // Navigation avec logique
    nextStep,
    prevStep,
    
    // Email verification avec logique
    sendEmailVerification,
    verifyEmail,
    
    // Registration process avec logique
    submitRegistration,
    completeRegistration,
  };
}