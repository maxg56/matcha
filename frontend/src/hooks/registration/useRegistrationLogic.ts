import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistrationStore } from '@/stores/registrationStore';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { RegistrationValidator } from '@/utils/registrationValidator';
import { authService } from '@/services/auth';
import { ErrorHandler } from '@/utils/errorHandler';

/**
 * Hook contenant toute la logique métier pour l'inscription
 * Le store ne contient que l'état, ce hook contient les algorithmes
 */
export function useRegistrationLogic() {
  const navigate = useNavigate();
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
      setLoading(false);
      throw error;
    }
  }, [formData.email, setLoading, clearGlobalError, setErrors, setGlobalError]);

  const verifyEmail = useCallback(async () => {
    setLoading(true);
    clearGlobalError();
    
    try {
      await authService.verifyEmail(formData.email, emailVerificationCode);
      setEmailVerified(true);
      setCurrentStep(3);
      setErrors({});
      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Code de vérification invalide';
      const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'registration');
      
      setErrors({ ...fieldErrors });
      setGlobalError(globalError || 'Code de vérification invalide');
      setLoading(false);
      throw error;
    }
  }, [formData.email, emailVerificationCode, setLoading, clearGlobalError, setEmailVerified, setCurrentStep, setErrors, setGlobalError]);

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
      // 1. Upload des images depuis le store
      const uploadPromises = selectedImages.map(async (imagePreview) => {
        const formData = new FormData();
        formData.append('file', imagePreview.file);
        
        const response = await fetch('/api/v1/media/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload image: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result.data.url;
      });
      
      // Les images sont uploadées mais pas utilisées dans le payload pour l'instant
      await Promise.all(uploadPromises);

      // 2. Préparer les données de profil à partir du formulaire d'inscription
      const profileUpdatePayload = RegistrationValidator.prepareProfilePayload(formData);
      
      // 3. Les images sont gérées séparément via l'API d'upload
      // profileUpdatePayload.images = imageUrls;

      // 4. Mettre à jour le profil utilisateur
      const currentUser = useAuthStore.getState().user;
      if (!currentUser?.id) {
        throw new Error('User not found, please login again');
      }

      await useUserStore.getState().updateProfile(profileUpdatePayload);
      
      // 5. Succès - rediriger vers la page de découverte
      setSubmitting(false);
      setLoading(false);
      navigate('/app/discover');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la finalisation du profil';
      
      // Gestion des erreurs spécifiques
      if (errorMessage.includes('failed to update tags')) {
        // Try to update profile without tags first, then handle tags separately
        try {
          const profilePayloadWithoutTags = RegistrationValidator.prepareProfilePayload(formData);
          const { tags: _tags, ...payloadWithoutTags } = profilePayloadWithoutTags;
          
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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
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
      setSubmitting(false);
      setLoading(false);
      
      throw error;
    }
  }, [isAccountCreated, selectedImages, formData, setSubmitting, setLoading, clearGlobalError, setGlobalError, setErrors]);

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