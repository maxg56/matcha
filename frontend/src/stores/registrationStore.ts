import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';
import { defaultRegistrationData } from '@/types/registration';
import { RegistrationValidator } from '@/utils/registrationValidator';
import { authService } from '@/services/auth';
import { ErrorHandler } from '@/utils/errorHandler';
import { useAuthStore } from './authStore';
import { useUserStore } from './userStore';
import type { ImagePreview } from '@/components/registration/steps/image-upload/types';

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
  selectedImages: ImagePreview[];
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
  
  // Email verification
  setEmailVerificationCode: (code: string) => void;
  setEmailVerified: (verified: boolean) => void;
  setAccountCreated: (created: boolean) => void;
  sendEmailVerification: () => Promise<void>;
  verifyEmail: () => Promise<void>;

  // Image management
  addImages: (images: ImagePreview[]) => void;
  removeImage: (imageId: string) => void;
  clearImages: () => void;

  // Registration process
  submitRegistration: () => Promise<void>;
  completeRegistration: () => Promise<void>;
}

type RegistrationStore = RegistrationState & RegistrationActions;

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
      selectedImages: [],

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
        // Clean up image previews
        const { selectedImages } = get();
        selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
        
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
          selectedImages: [],
        });
      },

      // === NAVIGATION ===
      setCurrentStep: (currentStep) => set({ currentStep }),
      
      nextStep: () => {
        const { currentStep, validateCurrentStep, isAccountCreated } = get();
        if (validateCurrentStep()) {
          set({ globalError: '' });
          
          // Si on passe de l'étape 1 à l'étape 2 et que le compte n'est pas encore créé
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

      // === EMAIL VERIFICATION STATE ===
      setEmailVerificationCode: (emailVerificationCode: string) => {
        set({ emailVerificationCode });
        if (emailVerificationCode.length > 0) {
          set(state => {
            const { emailVerificationCode: _, ...restErrors } = state.errors;
            return { errors: restErrors, globalError: '' };
          });
        }
      },

      setEmailVerified: (isEmailVerified: boolean) => set({ isEmailVerified }),
      setAccountCreated: (isAccountCreated: boolean) => set({ isAccountCreated }),

      // === IMAGE MANAGEMENT ===
      addImages: (newImages: ImagePreview[]) => {
        set(state => ({
          selectedImages: [...state.selectedImages, ...newImages]
        }));
      },

      removeImage: (imageId: string) => {
        set(state => {
          const imageToRemove = state.selectedImages.find(img => img.id === imageId);
          if (imageToRemove) {
            URL.revokeObjectURL(imageToRemove.preview);
          }
          return {
            selectedImages: state.selectedImages.filter(img => img.id !== imageId)
          };
        });
      },

      clearImages: () => {
        const { selectedImages } = get();
        selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
        set({ selectedImages: [] });
      },

      // === EMAIL VERIFICATION ACTIONS ===
      sendEmailVerification: async () => {
        const { formData } = get();
        set({ isLoading: true, globalError: '' });
        
        try {
          await authService.sendEmailVerification(formData.email);
          set({ isLoading: false });
        } catch (error) {
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
            currentStep: 3,
            errors: {},
            isLoading: false
          });
        } catch (error) {
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

      // === REGISTRATION PROCESS ===
      submitRegistration: async () => {
        const { formData, currentStep } = get();
        set({ isSubmitting: true, isLoading: true, globalError: '' });
        
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
        const { formData, isAccountCreated, selectedImages } = get();
        
        if (!isAccountCreated) {
          throw new Error('Account must be created first');
        }
        
        // Vérifier qu'au moins une image est présente (obligatoire)
        if (selectedImages.length === 0) {
          throw new Error('Au moins une image est requise pour finaliser votre profil');
        }
        
        set({ isSubmitting: true, isLoading: true, globalError: '' });
        
        try {
          // 1. Upload des images depuis le store
          let imageUrls: string[] = [];
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
          
          imageUrls = await Promise.all(uploadPromises);

          // 2. Préparer les données de profil à partir du formulaire d'inscription
          const profileUpdatePayload = RegistrationValidator.prepareProfilePayload(formData);
          
          // 3. Ajouter les URLs des images uploadées (obligatoires)
          profileUpdatePayload.images = imageUrls;

          // 4. Mettre à jour le profil utilisateur
          const currentUser = useAuthStore.getState().user;
          if (!currentUser?.id) {
            throw new Error('User not found, please login again');
          }

          await useUserStore.getState().updateProfile(profileUpdatePayload);
          
          // 5. Succès - rediriger vers la page de découverte
          set({ isSubmitting: false, isLoading: false });
          window.location.href = '/app/discover';
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la finalisation du profil';
          
          // Gestion des erreurs spécifiques
          if (errorMessage.includes('failed to update tags')) {
            // Try to update profile without tags first, then handle tags separately
            try {
              const profilePayloadWithoutTags = RegistrationValidator.prepareProfilePayload(formData);
              const { tags, ...payloadWithoutTags } = profilePayloadWithoutTags;
              
              await useUserStore.getState().updateProfile(payloadWithoutTags);
              
              // Profile updated successfully without tags, continue to discover page
              window.location.href = '/app/discover';
              return;
            } catch (retryError) {
              console.error('Failed to update profile without tags:', retryError);
            }
          } 
          
          if (errorMessage.includes('token expired') || errorMessage.includes('unauthorized')) {
            // Clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
            set({ 
              errors: { images: 'Session expirée. Veuillez vous reconnecter.' },
              globalError: 'Session expirée. Redirection en cours...',
              isLoading: false,
              isSubmitting: false
            });
            
            setTimeout(() => {
              window.location.href = '/login';
            }, 3000);
            
            throw new Error('token expired');
          }
          
          // Autres erreurs
          const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'profile');
          
          set({ 
            errors: fieldErrors, 
            globalError,
            isSubmitting: false, 
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