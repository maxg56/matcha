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

// === TYPES ===
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
  // Data management
  updateField: <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => void;
  toggleTag: (tag: string) => void;
  resetForm: () => void;
  
  // Navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Error management
  setErrors: (errors: FieldValidationErrors) => void;
  clearError: (field: string) => void;
  setGlobalError: (error: string) => void;
  clearGlobalError: () => void;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  
  // Validation
  validateCurrentStep: () => boolean;
  canContinue: () => boolean;
  
  // Availability checks
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  checkEmailAvailability: (email: string) => Promise<boolean>;
  
  // Email verification
  setEmailVerificationCode: (code: string) => void;
  sendEmailVerification: () => Promise<void>;
  verifyEmail: () => Promise<void>;
  
  // Registration process
  submitRegistration: () => Promise<void>;
  completeRegistration: () => Promise<void>;
  
  // Image upload
  uploadImages: (files: File[]) => Promise<void>;
}

type RegistrationStore = RegistrationState & RegistrationActions;
// === UTILITIES ===
const createErrorState = (fieldErrors: FieldValidationErrors = {}, globalError = '', isLoading = false) => ({
  errors: fieldErrors,
  globalError,
  isLoading,
  isSubmitting: false,
});

const dispatchUploadEvent = (type: string, message: string, extra: Record<string, any> = {}) => {
  const event = new CustomEvent('smash-upload-notification', {
    detail: { type, message, ...extra }
  });
  window.dispatchEvent(event);
};

const dispatchProfileEvent = (type: string, message: string, error?: string) => {
  const event = new CustomEvent('profile-completion-notification', {
    detail: { type, message, error }
  });
  window.dispatchEvent(event);
};

const handleTokenExpiration = async (retryFn: () => Promise<void>) => {
  const refreshSuccess = await attemptTokenRefresh();
  
  if (refreshSuccess) {
    try {
      await retryFn();
      return true;
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    }
  }
  
  // Clear tokens and redirect to login
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  setTimeout(() => {
    window.location.href = '/login';
  }, 3000);
  
  return false;
};

const handleAvailabilityCheck = async (
  field: 'username' | 'email',
  value: string,
  checkFunction: (value: string) => Promise<{ available: boolean; message?: string }>,
  set: (updater: (state: RegistrationStore) => Partial<RegistrationStore>) => void
): Promise<boolean> => {
  try {
    const response = await checkFunction(value);
    
    if (!response.available) {
      set(state => ({
        errors: { 
          ...state.errors, 
          [field]: response.message || `Ce ${field === 'username' ? 'pseudo' : 'email'} n'est pas disponible` 
        }
      }));
      return false;
    }
    
    // Clear error if available
    set(state => {
      const { [field]: fieldError, ...restErrors } = state.errors;
      return { errors: restErrors };
    });
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `Erreur lors de la vérification du ${field}`;
    const { fieldErrors } = ErrorHandler.parseAPIError(errorMessage, 'registration');
    
    set(state => ({
      errors: { 
        ...state.errors, 
        [field]: fieldErrors[field] || `Erreur lors de la vérification du ${field}` 
      }
    }));
    return false;
  }
};

// === STORE ===
export const useRegistrationStore = create<RegistrationStore>()(
  devtools(
    (set, get) => ({
      // === INITIAL STATE ===
      formData: defaultRegistrationData,
      currentStep: 1,
      isLoading: false,
      errors: {},
      globalError: '',
      isSubmitting: false,
      emailVerificationCode: '',
      isEmailVerified: false,
      isAccountCreated: false,

      // === DATA MANAGEMENT ===
      updateField: <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => {
        set(state => ({
          formData: { ...state.formData, [field]: value },
          errors: { ...state.errors, [field]: '' },
          globalError: ''
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
          set({ globalError: '' });
          
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
          globalError: ''
        }));
      },

      // === ERROR MANAGEMENT ===
      setErrors: (errors) => set({ errors }),
      clearError: (field) => set(state => ({
        errors: { ...state.errors, [field]: '' }
      })),
      setGlobalError: (globalError) => set({ globalError }),
      clearGlobalError: () => set({ globalError: '' }),

      // === LOADING STATES ===
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

      // === AVAILABILITY CHECKS ===
      checkUsernameAvailability: (username: string) => 
        handleAvailabilityCheck('username', username, authService.checkUsernameAvailability, set),

      checkEmailAvailability: (email: string) => 
        handleAvailabilityCheck('email', email, authService.checkEmailAvailability, set),

      // === EMAIL VERIFICATION ===
      setEmailVerificationCode: (emailVerificationCode: string) => {
        set({ emailVerificationCode });
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
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du code';
          const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'registration');
          
          set(createErrorState(fieldErrors, globalError || 'Erreur lors de l\'envoi du code de vérification'));
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
            currentStep: 3,
            errors: {},
            isLoading: false
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Code de vérification invalide';
          const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'registration');
          
          set(createErrorState(fieldErrors, globalError || 'Code de vérification invalide'));
          throw error;
        }
      },

      // === REGISTRATION PROCESS ===
      submitRegistration: async () => {
        const { formData, currentStep } = get();
        set({ isSubmitting: true, isLoading: true, globalError: '' });
        
        try {
          if (currentStep === 1) {
            const basicPayload = RegistrationValidator.prepareAccountPayload(formData);
            await useAuthStore.getState().register(basicPayload);
            
            set({ 
              isAccountCreated: true,
              currentStep: 2,
              isSubmitting: false,
              isLoading: false
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
          const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'registration');
          
          set({ ...createErrorState(fieldErrors, globalError) });
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
          const profileUpdatePayload = RegistrationValidator.prepareProfilePayload(formData);
          const currentUser = useAuthStore.getState().user;
          
          if (!currentUser?.id) {
            throw new Error('User not found, please login again');
          }
          
          await useUserStore.getState().updateProfile(profileUpdatePayload);
          window.location.href = '/app/discover';
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la finalisation du profil';
          
          // Handle specific errors
          if (errorMessage.includes('failed to update tags')) {
            // Try to update profile without tags first, then handle tags separately
            try {
              const profilePayloadWithoutTags = RegistrationValidator.prepareProfilePayload(formData);
              const { tags, ...payloadWithoutTags } = profilePayloadWithoutTags;
              
              await useUserStore.getState().updateProfile(payloadWithoutTags);
              
              // Profile updated successfully without tags, continue to discover page
              window.location.href = '/app/discover';
              
              dispatchProfileEvent('tags_error', 'Profil créé avec succès ! Les centres d\'intérêt seront ajoutés plus tard.', 'tags_update_failed');
              return;
            } catch (retryError) {
              console.error('Failed to update profile without tags:', retryError);
            }
            
            dispatchProfileEvent('tags_error', 'Erreur tags - vous pouvez continuer et les modifier plus tard', 'tags_update_failed');
            set(createErrorState(
              { tags: 'Impossible de sauvegarder les tags pour le moment' },
              'Erreur lors de la mise à jour de vos centres d\'intérêt. Vous pouvez les modifier plus tard dans votre profil.'
            ));
          } else if (errorMessage.includes('token expired') || errorMessage.includes('unauthorized')) {
            const success = await handleTokenExpiration(get().completeRegistration);
            if (success) return;
            
            set(createErrorState({}, 'Session expirée. Redirection en cours...'));
          } else {
            const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'profile');
            set(createErrorState(fieldErrors, globalError));
          }
          
          throw error;
        }
      },

      // === IMAGE UPLOAD ===
      uploadImages: async (files: File[]) => {
        set({ isLoading: true, globalError: '' });
        
        try {
          const uploadPromises = files.map(async (file, index) => {
            const formData = new FormData();
            formData.append('file', file);
            
            dispatchUploadEvent('upload_progress', `Upload en cours: ${index + 1}/${files.length} photos`, {
              imageCount: index + 1,
              totalImages: files.length
            });
            
            const response = await fetch('/api/v1/media/upload', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
              body: formData,
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to upload ${file.name}: ${errorText}`);
            }
            
            return (await response.json()).data;
          });
          
          await Promise.all(uploadPromises);
          
          dispatchUploadEvent('upload_success', `${files.length} photos uploadées avec succès !`, {
            imageCount: files.length
          });
          
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors du téléchargement des images';
          
          // Handle token expiration
          if (errorMessage.includes('token expired') || errorMessage.includes('unauthorized')) {
            dispatchUploadEvent('upload_progress', 'Session expirée. Tentative de renouvellement...', {
              error: 'token_refresh_attempt',
              imageCount: files.length
            });
            
            const refreshSuccess = await attemptTokenRefresh();
            
            if (refreshSuccess) {
              dispatchUploadEvent('upload_progress', 'Session renouvelée. Reprise de l\'upload...', {
                error: 'token_refreshed',
                imageCount: files.length
              });
              
              try {
                await get().uploadImages(files);
                return;
              } catch (retryError) {
                console.error('Retry upload failed:', retryError);
              }
            }
            
            // Token refresh failed
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
            dispatchUploadEvent('upload_error', 'Session expirée. Redirection vers la connexion...', {
              error: 'token_expired',
              imageCount: files.length
            });
            
            set({ 
              errors: { images: 'Session expirée. Veuillez vous reconnecter.' },
              globalError: 'Session expirée. Redirection en cours...',
              isLoading: false 
            });
            
            setTimeout(() => {
              window.location.href = '/login';
            }, 3000);
            
            throw new Error('token expired');
          }
          
          // Handle other errors
          const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'profile');
          
          dispatchUploadEvent('upload_error', errorMessage, {
            error: errorMessage,
            imageCount: files.length
          });
          
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