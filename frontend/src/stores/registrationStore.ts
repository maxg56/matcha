import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';
import { defaultRegistrationData } from '@/types/registration';
import { useAuthStore } from './authStore';
import { authService } from '@/services/auth';
import { useUserStore } from './userStore';

interface RegistrationState {
  formData: RegistrationData;
  currentStep: number;
  isLoading: boolean;
  errors: FieldValidationErrors;
  isSubmitting: boolean;
  emailVerificationCode: string;
  isEmailVerified: boolean;
  isAccountCreated: boolean; // Track if account has been created
  tempUserId?: string; // Store temporary user ID after registration
}
;
interface RegistrationActions {
  updateField: <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => void;
  toggleTag: (tag: string) => void;
  setCurrentStep: (step: number) => void;
  setErrors: (errors: FieldValidationErrors) => void;
  clearError: (field: string) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  validateStep: (step: number) => boolean;
  canContinue: (step: number) => boolean;
  nextStep: () => void;
  prevStep: () => void;
  submitRegistration: () => Promise<void>;
  completeRegistration: () => Promise<void>;
  resetForm: () => void;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  checkEmailAvailability: (email: string) => Promise<boolean>;
  
  // Email verification
  setEmailVerificationCode: (code: string) => void;
  sendEmailVerification: () => Promise<void>;
  verifyEmail: () => Promise<void>;
  
  // Image upload
  uploadImages: () => Promise<void>;
}

type RegistrationStore = RegistrationState & RegistrationActions;

export const useRegistrationStore = create<RegistrationStore>()(
  devtools(
    (set, get) => ({
      formData: defaultRegistrationData,
      currentStep: 1,
      isLoading: false,
      errors: {},
      isSubmitting: false,
      emailVerificationCode: '',
      isEmailVerified: false,
      isAccountCreated: false,
      tempUserId: undefined,

      updateField: <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => {
        set(state => ({
          formData: { ...state.formData, [field]: value },
          errors: { ...state.errors, [field]: '' } // Clear error when field is updated
        }));
      },

      toggleTag: (tag: string) => {
        const { formData } = get();
        const newTags = formData.tags.includes(tag)
          ? formData.tags.filter(t => t !== tag)
          : [...formData.tags, tag];
        
        get().updateField('tags', newTags);
      },

      setCurrentStep: (currentStep) => set({ currentStep }),
      setErrors: (errors) => set({ errors }),
      clearError: (field) => set(state => ({
        errors: { ...state.errors, [field]: '' }
      })),
      setLoading: (isLoading) => set({ isLoading }),
      setSubmitting: (isSubmitting) => set({ isSubmitting }),

      validateStep: (step: number): boolean => {
        const { formData, emailVerificationCode, isEmailVerified } = get();
        const newErrors: FieldValidationErrors = {};
        
        switch (step) {
          case 1: // Account Step - Basic account creation
            if (!formData.username) newErrors.username = 'Pseudo requis';
            if (!formData.firstName) newErrors.firstName = 'Prénom requis';
            if (!formData.lastName) newErrors.lastName = 'Nom requis';
            if (!formData.email) newErrors.email = 'Email requis';
            if (!formData.password) newErrors.password = 'Mot de passe requis';
            if (formData.password.length < 8) newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
            if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirmation du mot de passe requise';
            if (formData.password !== formData.confirmPassword) {
              newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
            }
            // Essential fields required by backend
            if (!formData.birthDate) newErrors.birthDate = 'Date de naissance requise';
            if (!formData.gender) newErrors.gender = 'Genre requis';
            if (!formData.sexPref) newErrors.sexPref = 'Préférence requise';
            if (!formData.relationshipType) newErrors.relationshipType = 'Type de relation requis';
            
            // Validate age (must be at least 18)
            if (formData.birthDate) {
              const birthDate = new Date(formData.birthDate);
              const today = new Date();
              const age = today.getFullYear() - birthDate.getFullYear();
              if (age < 18) {
                newErrors.birthDate = 'Vous devez avoir au moins 18 ans';
              }
            }
            break;
          
          case 2: // Email Verification
            if (!emailVerificationCode.trim()) newErrors.emailVerificationCode = 'Code de vérification requis';
            if (!isEmailVerified) newErrors.emailVerificationCode = 'Email non vérifié';
            break;

          case 3: // Basic Info Step - now just height
            // Height is optional, no validation needed
            break;

          case 4: // Appearance Step
            if (!formData.hairColor) newErrors.hairColor = 'Couleur de cheveux requise';
            if (!formData.eyeColor) newErrors.eyeColor = 'Couleur des yeux requise';
            if (!formData.skinColor) newErrors.skinColor = 'Couleur de peau requise';
            if (formData.height < 120 || formData.height > 250) {
              newErrors.height = 'Taille invalide';
            }
            break;

          case 5: // Lifestyle Step
            if (!formData.alcoholConsumption) newErrors.alcoholConsumption = 'Consommation d\'alcool requise';
            if (!formData.smoking) newErrors.smoking = 'Tabagisme requis';
            if (!formData.cannabis) newErrors.cannabis = 'Cannabis requis';
            if (!formData.drugs) newErrors.drugs = 'Drogues requis';
            break;

          case 6: // Activity Step
            if (!formData.socialActivityLevel) newErrors.socialActivityLevel = 'Niveau d\'activité sociale requis';
            if (!formData.sportActivity) newErrors.sportActivity = 'Activité sportive requise';
            if (!formData.educationLevel) newErrors.educationLevel = 'Niveau d\'éducation requis';
            break;

          case 7: // Personal Step
            if (!formData.bio.trim()) newErrors.bio = 'Biographie requise';
            if (formData.bio.length < 50) newErrors.bio = 'La biographie doit contenir au moins 50 caractères';
            if (!formData.birthCity) newErrors.birthCity = 'Ville de naissance requise';
            if (!formData.currentCity) newErrors.currentCity = 'Ville actuelle requise';
            if (!formData.job) newErrors.job = 'Profession requise';
            if (!formData.religion) newErrors.religion = 'Religion requise';
            if (!formData.childrenStatus) newErrors.childrenStatus = 'Statut enfants requis';
            if (!formData.politicalView) newErrors.politicalView = 'Vue politique requise';
            break;

          case 8: // Interests Step
            if (formData.tags.length < 3) newErrors.tags = 'Sélectionnez au moins 3 centres d\'intérêt';
            break;

          case 9: // Image Upload Step
            // Images will be validated in the upload component
            break;
        }
        
        set({ errors: newErrors });
        return Object.keys(newErrors).length === 0;
      },

      canContinue: (step: number): boolean => {
        const { formData, isEmailVerified } = get();
        
        switch (step) {
          case 1: // Account Step
            return !!(
              formData.username &&
              formData.firstName &&
              formData.lastName &&
              formData.email &&
              formData.password &&
              formData.confirmPassword &&
              formData.password === formData.confirmPassword &&
              formData.password.length >= 8 &&
              formData.birthDate &&
              formData.gender &&
              formData.sexPref &&
              formData.relationshipType
            );
          
          case 2: // Email verification
            return isEmailVerified;
          
          case 3: // Basic Info Step - now just height
            return true; // Height is optional, can always continue

          case 4: // Appearance Step
            return !!(
              formData.hairColor &&
              formData.eyeColor &&
              formData.skinColor &&
              formData.height >= 120 &&
              formData.height <= 250
            );

          case 5: // Lifestyle Step
            return !!(
              formData.alcoholConsumption &&
              formData.smoking &&
              formData.cannabis &&
              formData.drugs
            );

          case 6: // Activity Step
            return !!(
              formData.socialActivityLevel &&
              formData.sportActivity &&
              formData.educationLevel
            );

          case 7: // Personal Step
            return !!(
              formData.bio.trim() &&
              formData.bio.length >= 50 &&
              formData.birthCity &&
              formData.currentCity &&
              formData.job &&
              formData.religion &&
              formData.childrenStatus &&
              formData.politicalView
            );

          case 8: // Interests Step
            return formData.tags.length >= 3;
          
          case 9: // Image upload
            return true; // Images are optional for now
          
          default:
            return true;
        }
      },

      nextStep: () => {
        const { currentStep, validateStep, isAccountCreated } = get();
        if (validateStep(currentStep)) {
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
          errors: {} // Clear errors when going back
        }));
      },

      submitRegistration: async () => {
        const { formData, currentStep } = get();
        set({ isSubmitting: true, isLoading: true });
        
        try {
          if (currentStep === 1) {
            // Step 1: Create account with all required backend fields
            const basicPayload = {
              username: formData.username,
              email: formData.email,
              password: formData.password,
              first_name: formData.firstName,
              last_name: formData.lastName,
              birth_date: formData.birthDate,
              gender: formData.gender,
              sex_pref: formData.sexPref,
              relationship_type: formData.relationshipType
            };

            console.log('Creating account after step 1 with basic fields:', basicPayload);
            await useAuthStore.getState().register(basicPayload);
            
            // Mark account as created and move to email verification
            set({ 
              isAccountCreated: true,
              currentStep: 2 
            });
            
          }
          
        } catch (error) {
          console.error('Registration failed:', error);
          throw error;
        } finally {
          set({ isSubmitting: false, isLoading: false });
        }
      },

      completeRegistration: async () => {
        const { formData, isAccountCreated } = get();
        
        if (!isAccountCreated) {
          throw new Error('Account must be created first');
        }
        
        set({ isSubmitting: true, isLoading: true });
        
        try {
          // Create profile update payload with all additional information
          const profileUpdatePayload = {
            height: formData.height,
            hair_color: formData.hairColor,
            eye_color: formData.eyeColor,
            skin_color: formData.skinColor,
            alcohol_consumption: formData.alcoholConsumption,
            smoking: formData.smoking,
            cannabis: formData.cannabis,
            drugs: formData.drugs,
            pets: formData.pets,
            social_activity_level: formData.socialActivityLevel,
            sport_activity: formData.sportActivity,
            education_level: formData.educationLevel,
            bio: formData.bio,
            birth_city: formData.birthCity,
            current_city: formData.currentCity,
            job: formData.job,
            religion: formData.religion,
            children_status: formData.childrenStatus,
            political_view: formData.politicalView,
            tags: formData.tags
          };

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
          throw error;
        } finally {
          set({ isSubmitting: false, isLoading: false });
        }
      },

      resetForm: () => {
        set({
          formData: defaultRegistrationData,
          currentStep: 1,
          isLoading: false,
          errors: {},
          isSubmitting: false,
          emailVerificationCode: '',
          isEmailVerified: false,
          isAccountCreated: false,
          tempUserId: undefined,
        });
      },

      checkUsernameAvailability: async (username: string): Promise<boolean> => {
        try {
          const response = await authService.checkUsernameAvailability(username);
          if (!response.available) {
            get().setErrors({ username: response.message || 'Ce pseudo n\'est pas disponible' });
          }
          return response.available;
        } catch (error) {
          console.error('Username availability check failed:', error);
          get().setErrors({ username: 'Erreur lors de la vérification du pseudo' });
          return false;
        }
      },

      checkEmailAvailability: async (email: string): Promise<boolean> => {
        try {
          const response = await authService.checkEmailAvailability(email);
          if (!response.available) {
            get().setErrors({ email: response.message || 'Cet email n\'est pas disponible' });
          }
          return response.available;
        } catch (error) {
          console.error('Email availability check failed:', error);
          get().setErrors({ email: 'Erreur lors de la vérification de l\'email' });
          return false;
        }
      },

      // Email verification methods
      setEmailVerificationCode: (emailVerificationCode: string) => {
        set({ emailVerificationCode });
      },

      sendEmailVerification: async () => {
        const { formData } = get();
        set({ isLoading: true });
        
        try {
          await authService.sendEmailVerification(formData.email);
          console.log('Email verification sent successfully');
        } catch (error) {
          console.error('Failed to send email verification:', error);
          set({ errors: { emailVerificationCode: 'Erreur lors de l\'envoi du code de vérification' } });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      verifyEmail: async () => {
        const { emailVerificationCode, formData } = get();
        set({ isLoading: true });
        
        try {
          await authService.verifyEmail(formData.email, emailVerificationCode);
          set({ 
            isEmailVerified: true,
            currentStep: 3, // Move to basic info step (height)
            errors: {}
          });
          console.log('Email verified successfully');
        } catch (error) {
          console.error('Email verification failed:', error);
          set({ errors: { emailVerificationCode: 'Code de vérification invalide' } });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Image upload method
      uploadImages: async (files: File[]) => {
        set({ isLoading: true });
        
        try {
          const uploadPromises = files.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/v1/media/upload', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              },
              body: formData,
            });
            
            if (!response.ok) {
              throw new Error(`Failed to upload ${file.name}`);
            }
            
            const result = await response.json();
            return result.data;
          });
          
          const uploadResults = await Promise.all(uploadPromises);
          console.log('Images uploaded successfully:', uploadResults);
          
          // Finalize registration by redirecting to app
          window.location.href = '/app/discover';
        } catch (error) {
          console.error('Image upload failed:', error);
          set({ errors: { images: 'Erreur lors du téléchargement des images' } });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    { name: 'RegistrationStore' }
  )
);

export type { RegistrationData, FieldValidationErrors };