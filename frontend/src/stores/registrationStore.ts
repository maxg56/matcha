import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';
import { defaultRegistrationData } from '@/types/registration';
import { RegistrationValidator } from '@/utils/registrationValidator';
import { authService } from '@/services/auth';
import { ErrorHandler } from '@/utils/errorHandler';
import { useAuthStore } from './authStore';

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
  
  // Email verification
  setEmailVerificationCode: (code: string) => void;
  setEmailVerified: (verified: boolean) => void;
  setAccountCreated: (created: boolean) => void;
  sendEmailVerification: () => Promise<void>;
  verifyEmail: () => Promise<void>;

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
        // Cette fonction sera implémentée pour la finalisation du profil
        // Pour l'instant, on redirige vers l'app
        window.location.href = '/app/discover';
      },
    }),
    { name: 'RegistrationStore' }
  )
);

export type { RegistrationData, FieldValidationErrors };