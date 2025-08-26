import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';
import { defaultRegistrationData } from '@/types/registration';
import { useAuthStore } from './authStore';
import { authService } from '@/services/auth';
import { useUserStore } from './userStore';
import { ErrorHandler } from '@/utils/errorHandler';
import { RegistrationValidator } from '@/utils/registrationValidator';
import { attemptTokenRefresh } from '@/utils/smashNotifications';

interface RegistrationState {
  formData: RegistrationData;
  currentStep: number;
  isLoading: boolean;
  errors: FieldValidationErrors;
  globalError: string;
  isSubmitting: boolean;
  emailVerificationCode: string;
  isEmailVerified: boolean;
  isAccountCreated: boolean;
}

interface RegistrationActions {
  // === GESTION DES DONNÉES ===
  updateField: <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => void;
  toggleTag: (tag: string) => void;
  resetForm: () => void;
  
  // === NAVIGATION ===
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // === GESTION DES ERREURS ===
  setErrors: (errors: FieldValidationErrors) => void;
  clearError: (field: string) => void;
  setGlobalError: (error: string) => void;
  clearGlobalError: () => void;
  
  // === ÉTATS DE CHARGEMENT ===
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  
  // === VALIDATION ===
  validateCurrentStep: () => boolean;
  canContinue: () => boolean;
  
  // === VÉRIFICATIONS DE DISPONIBILITÉ ===
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  checkEmailAvailability: (email: string) => Promise<boolean>;
  
  // === VÉRIFICATION EMAIL ===
  setEmailVerificationCode: (code: string) => void;
  sendEmailVerification: () => Promise<void>;
  verifyEmail: () => Promise<void>;
  
  // === PROCESSUS D'INSCRIPTION ===
  submitRegistration: () => Promise<void>;
  completeRegistration: () => Promise<void>;
  
  // === UPLOAD D'IMAGES ===
  uploadImages: (files: File[]) => Promise<void>;
}

type RegistrationStore = RegistrationState & RegistrationActions;

export const useRegistrationStore = create<RegistrationStore>()(
  devtools(
    (set, get) => ({
      // === ÉTAT INITIAL ===
      formData: defaultRegistrationData,
      currentStep: 1,
      isLoading: false,
      errors: {},
      globalError: '',
      isSubmitting: false,
      emailVerificationCode: '',
      isEmailVerified: false,
      isAccountCreated: false,

      // === GESTION DES DONNÉES ===
      updateField: <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => {
        set(state => ({
          formData: { ...state.formData, [field]: value },
          errors: { ...state.errors, [field]: '' }, // Clear field error
          globalError: '' // Clear global error when user makes changes
        }));
      },

      toggleTag: (tag: string) => {
        const { formData } = get();
        const newTags = formData.tags.includes(tag)
          ? formData.tags.filter(t => t !== tag)
          : [...formData.tags, tag];
        
        get().updateField('tags', newTags);
      },

      resetForm: () => {
        set({
          formData: defaultRegistrationData,
          currentStep: 1,
          isLoading: false,
          errors: {},
          globalError: '',
          isSubmitting: false,
          emailVerificationCode: '',
          isEmailVerified: false,
          isAccountCreated: false,
        });
      },

      // === NAVIGATION ===
      setCurrentStep: (currentStep) => set({ currentStep }),
      
      nextStep: () => {
        const { currentStep, validateCurrentStep, isAccountCreated } = get();
        if (validateCurrentStep()) {
          // Clear any previous errors when moving to next step
          set({ globalError: '' });
          
          // If we're finishing step 1 (Account Info) and account not created yet, create it
          if (currentStep === 1 && !isAccountCreated) {
            get().submitRegistration();
          } else {
            set({ currentStep: currentStep + 1 });
          }
        }
      },

      prevStep: () => {
        set(state => ({ 
          currentStep: Math.max(state.currentStep - 1, 1),
          errors: {},
          globalError: '' // Clear all errors when going back
        }));
      },

      // === GESTION DES ERREURS ===
      setErrors: (errors) => set({ errors }),
      clearError: (field) => set(state => ({
        errors: { ...state.errors, [field]: '' }
      })),
      setGlobalError: (globalError) => set({ globalError }),
      clearGlobalError: () => set({ globalError: '' }),

      // === ÉTATS DE CHARGEMENT ===
      setLoading: (isLoading) => set({ isLoading }),
      setSubmitting: (isSubmitting) => set({ isSubmitting }),

      // === VALIDATION ===
      validateCurrentStep: (): boolean => {
        const { currentStep, formData, isEmailVerified } = get();
        const newErrors = RegistrationValidator.validateStep(currentStep, formData, isEmailVerified);
        
        set({ errors: newErrors });
        return Object.keys(newErrors).length === 0;
      },

      canContinue: (): boolean => {
        const { currentStep, formData, isEmailVerified } = get();
        return RegistrationValidator.canContinueStep(currentStep, formData, isEmailVerified);
      },

      // === VÉRIFICATIONS DE DISPONIBILITÉ ===
      checkUsernameAvailability: async (username: string): Promise<boolean> => {
        try {
          const response = await authService.checkUsernameAvailability(username);
          if (!response.available) {
            set(state => ({
              errors: { ...state.errors, username: response.message || 'Ce pseudo n\'est pas disponible' }
            }));
          } else {
            // Clear username error if available
            set(state => {
              const { username, ...restErrors } = state.errors;
              return { errors: restErrors };
            });
          }
          return response.available;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la vérification du pseudo';
          const { fieldErrors } = ErrorHandler.parseAPIError(errorMessage, 'registration');
          
          set(state => ({
            errors: { ...state.errors, username: fieldErrors.username || 'Erreur lors de la vérification du pseudo' }
          }));
          return false;
        }
      },

      checkEmailAvailability: async (email: string): Promise<boolean> => {
        try {
          const response = await authService.checkEmailAvailability(email);
          if (!response.available) {
            set(state => ({
              errors: { ...state.errors, email: response.message || 'Cet email n\'est pas disponible' }
            }));
          } else {
            // Clear email error if available
            set(state => {
              const { email, ...restErrors } = state.errors;
              return { errors: restErrors };
            });
          }
          return response.available;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la vérification de l\'email';
          const { fieldErrors } = ErrorHandler.parseAPIError(errorMessage, 'registration');
          
          set(state => ({
            errors: { ...state.errors, email: fieldErrors.email || 'Erreur lors de la vérification de l\'email' }
          }));
          return false;
        }
      },

      // === VÉRIFICATION EMAIL ===
      setEmailVerificationCode: (emailVerificationCode: string) => {
        set({ emailVerificationCode });
        // Clear verification errors when typing
        if (emailVerificationCode.length > 0) {
          set(state => {
            const { emailVerificationCode, ...restErrors } = state.errors;
            return { errors: restErrors, globalError: '' };
          });
        }
      },

      sendEmailVerification: async () => {
        const { formData } = get();
        set({ isLoading: true, globalError: '' });
        
        try {
          await authService.sendEmailVerification(formData.email);
          console.log('Email verification sent successfully');
          set({ isLoading: false });
        } catch (error) {
          console.error('Failed to send email verification:', error);
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du code';
          const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'registration');
          
          set({ 
            errors: { ...fieldErrors },
            globalError: globalError || 'Erreur lors de l\'envoi du code de vérification',
            isLoading: false 
          });
          throw error;
        }
      },

      verifyEmail: async () => {
        const { emailVerificationCode, formData } = get();
        set({ isLoading: true, globalError: '' });
        
        try {
          await authService.verifyEmail(formData.email, emailVerificationCode);
          set({ 
            isEmailVerified: true,
            currentStep: 3, // Move to basic info step (height)
            errors: {},
            isLoading: false
          });
          console.log('Email verified successfully');
        } catch (error) {
          console.error('Email verification failed:', error);
          const errorMessage = error instanceof Error ? error.message : 'Code de vérification invalide';
          const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'registration');
          
          set({ 
            errors: { ...fieldErrors },
            globalError: globalError || 'Code de vérification invalide',
            isLoading: false 
          });
          throw error;
        }
      },

      // === PROCESSUS D'INSCRIPTION ===
      submitRegistration: async () => {
        const { formData, currentStep } = get();
        set({ isSubmitting: true, isLoading: true, globalError: '' });
        
        try {
          if (currentStep === 1) {
            // Step 1: Create account with all required backend fields
            const basicPayload = RegistrationValidator.prepareAccountPayload(formData);

            console.log('Creating account after step 1 with basic fields:', basicPayload);
            await useAuthStore.getState().register(basicPayload);
            
            // Mark account as created and move to email verification
            set({ 
              isAccountCreated: true,
              currentStep: 2,
              isSubmitting: false,
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Registration failed:', error);
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
          const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'registration');
          
          set({ 
            errors: fieldErrors, 
            globalError,
            isSubmitting: false, 
            isLoading: false 
          });
          throw error;
        }
      },

      completeRegistration: async () => {
        const { formData, isAccountCreated } = get();
        
        if (!isAccountCreated) {
          throw new Error('Account must be created first');
        }
        
        set({ isSubmitting: true, isLoading: true, globalError: '' });
        
        try {
          // Create profile update payload with all additional information
          const profileUpdatePayload = RegistrationValidator.prepareProfilePayload(formData);

          console.log('Completing registration with profile data:', profileUpdatePayload);
          
          // Get the current user from auth store to get the user ID
          const currentUser = useAuthStore.getState().user;
          if (!currentUser?.id) {
            throw new Error('User not found, please login again');
          }
          
          // Use the userStore updateProfile method
          await useUserStore.getState().updateProfile(profileUpdatePayload);
          
          // Redirect to app after successful profile completion
          window.location.href = '/app/discover';
          
        } catch (error) {
          console.error('Profile completion failed:', error);
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la finalisation du profil';
          
          // Handle specific profile errors
          let customGlobalError = '';
          let customFieldErrors: FieldValidationErrors = {};
          
          if (errorMessage.includes('failed to update tags')) {
            customGlobalError = 'Erreur lors de la mise à jour de vos centres d\'intérêt. Vous pouvez les modifier plus tard dans votre profil.';
            customFieldErrors = { tags: 'Impossible de sauvegarder les tags pour le moment' };
            
            // Dispatch notification for tags error
            const tagsErrorEvent = new CustomEvent('profile-completion-notification', {
              detail: {
                type: 'tags_error',
                message: 'Erreur tags - vous pouvez continuer et les modifier plus tard',
                error: 'tags_update_failed'
              }
            });
            window.dispatchEvent(tagsErrorEvent);
            
          } else if (errorMessage.includes('token expired') || errorMessage.includes('unauthorized')) {
            customGlobalError = 'Session expirée. Veuillez vous reconnecter.';
            
            // Try token refresh
            const refreshSuccess = await attemptTokenRefresh();
            if (refreshSuccess) {
              try {
                // Retry profile completion
                await get().completeRegistration();
                return; // Success, exit
              } catch (retryError) {
                console.error('Retry profile completion failed:', retryError);
              }
            }
            
            // Redirect to login
            setTimeout(() => {
              window.location.href = '/login';
            }, 3000);
            
          } else {
            // Parse other errors normally
            const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'profile');
            customFieldErrors = fieldErrors;
            customGlobalError = globalError;
          }
          
          set({ 
            errors: customFieldErrors, 
            globalError: customGlobalError,
            isSubmitting: false, 
            isLoading: false 
          });
          
          throw error;
        }
      },

      // === UPLOAD D'IMAGES ===
      uploadImages: async (files: File[]) => {
        set({ isLoading: true, globalError: '' });
        
        try {
          const uploadPromises = files.map(async (file, index) => {
            const formData = new FormData();
            formData.append('file', file);
            
            // Dispatch progress event for individual file upload
            const progressEvent = new CustomEvent('smash-upload-notification', {
              detail: {
                type: 'upload_progress',
                message: `Upload en cours: ${index + 1}/${files.length} photos`,
                imageCount: index + 1,
                totalImages: files.length
              }
            });
            window.dispatchEvent(progressEvent);
            
            const response = await fetch('/api/v1/media/upload', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              },
              body: formData,
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to upload ${file.name}: ${errorText}`);
            }
            
            const result = await response.json();
            return result.data;
          });
          
          const uploadResults = await Promise.all(uploadPromises);
          console.log('Images uploaded successfully:', uploadResults);
          
          // Dispatch success event
          const successEvent = new CustomEvent('smash-upload-notification', {
            detail: {
              type: 'upload_success',
              message: `${files.length} photos uploadées avec succès !`,
              imageCount: files.length
            }
          });
          window.dispatchEvent(successEvent);
          
          set({ isLoading: false });
          
          // Finalize registration by redirecting to app
          window.location.href = '/app/discover';
        } catch (error) {
          console.error('Image upload failed:', error);
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors du téléchargement des images';
          
          // Handle token expiration specifically
          if (errorMessage.includes('token expired') || errorMessage.includes('unauthorized')) {
            console.log('Token expired, attempting refresh...');
            
            // Dispatch refresh attempt event
            const refreshAttemptEvent = new CustomEvent('smash-upload-notification', {
              detail: {
                type: 'upload_progress',
                message: 'Session expirée. Tentative de renouvellement...',
                error: 'token_refresh_attempt',
                imageCount: files.length
              }
            });
            window.dispatchEvent(refreshAttemptEvent);
            
            // Try to refresh token
            const refreshSuccess = await attemptTokenRefresh();
            
            if (refreshSuccess) {
              // Token refreshed successfully, retry upload
              console.log('Token refreshed successfully, retrying upload...');
              
              const retryEvent = new CustomEvent('smash-upload-notification', {
                detail: {
                  type: 'upload_progress',
                  message: 'Session renouvelée. Reprise de l\'upload...',
                  error: 'token_refreshed',
                  imageCount: files.length
                }
              });
              window.dispatchEvent(retryEvent);
              
              // Recursive call to retry upload with new token
              try {
                await get().uploadImages(files);
                return; // Success, exit the catch block
              } catch (retryError) {
                console.error('Retry upload failed:', retryError);
                // Fall through to handle as normal error
              }
            }
            
            // Token refresh failed or retry failed, proceed with logout
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
            // Dispatch specific token error event
            const tokenErrorEvent = new CustomEvent('smash-upload-notification', {
              detail: {
                type: 'upload_error',
                message: 'Session expirée. Redirection vers la connexion...',
                error: 'token_expired',
                imageCount: files.length
              }
            });
            window.dispatchEvent(tokenErrorEvent);
            
            set({ 
              errors: { images: 'Session expirée. Veuillez vous reconnecter.' },
              globalError: 'Session expirée. Redirection en cours...',
              isLoading: false 
            });
            
            // Redirect to login after a brief delay
            setTimeout(() => {
              window.location.href = '/login';
            }, 3000);
            
            throw new Error('token expired');
          }
          
          const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'profile');
          
          // Dispatch error event
          const errorEvent = new CustomEvent('smash-upload-notification', {
            detail: {
              type: 'upload_error',
              message: errorMessage,
              error: errorMessage,
              imageCount: files.length
            }
          });
          window.dispatchEvent(errorEvent);
          
          set({ 
            errors: { ...fieldErrors, images: fieldErrors.images || 'Erreur lors du téléchargement des images' },
            globalError,
            isLoading: false 
          });
          throw error;
        }
      },
    }),
    { name: 'RegistrationStore' }
  )
);

export type { RegistrationData, FieldValidationErrors };