import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';
import { defaultRegistrationData } from '@/types/registration';
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
  
  // Error management
  setErrors: (errors: FieldValidationErrors) => void;
  clearError: (field: string) => void;
  setGlobalError: (error: string) => void;
  clearGlobalError: () => void;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  
  // Email verification state
  setEmailVerificationCode: (code: string) => void;
  setEmailVerified: (verified: boolean) => void;
  setAccountCreated: (created: boolean) => void;

  // Image management
  addImages: (images: ImagePreview[]) => void;
  removeImage: (imageId: string) => void;
  clearImages: () => void;
}

type RegistrationStore = RegistrationState & RegistrationActions;

// === STORE (ÉTAT SEULEMENT) ===
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

      // === EMAIL VERIFICATION STATE ===
      setEmailVerificationCode: (emailVerificationCode: string) => {
        set({ emailVerificationCode });
        if (emailVerificationCode.length > 0) {
          set(state => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { emailVerificationCode: _ignored, ...restErrors } = state.errors;
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
    }),
    { name: 'RegistrationStore' }
  )
);

export type { RegistrationData, FieldValidationErrors };