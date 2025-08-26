import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';
import { defaultRegistrationData } from '@/types/registration';
import { RegistrationValidator } from '@/utils/registrationValidator';

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
  
  // Email verification state
  setEmailVerificationCode: (code: string) => void;
  setEmailVerified: (verified: boolean) => void;
  setAccountCreated: (created: boolean) => void;
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
        const { currentStep, validateCurrentStep } = get();
        if (validateCurrentStep()) {
          set({ 
            globalError: '',
            currentStep: currentStep + 1 
          });
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
    }),
    { name: 'RegistrationStore' }
  )
);

export type { RegistrationData, FieldValidationErrors };