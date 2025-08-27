import { useRegistrationStore } from '@/stores/registrationStore';
import { useRegistrationLogic } from './useRegistrationLogic';

export function useRegistration() {
  // État depuis le store
  const {
    formData,
    currentStep,
    isLoading,
    errors,
    globalError,
    isSubmitting,
    emailVerificationCode,
    isEmailVerified,
    selectedImages,
    updateField,
    toggleTag,
    resetForm,
    clearGlobalError,
    setEmailVerificationCode,
  } = useRegistrationStore();
  
  // Logique métier depuis le hook dédié
  const {
    validateCurrentStep,
    canContinue,
    nextStep,
    prevStep,
    sendEmailVerification,
    verifyEmail,
    submitRegistration,
    completeRegistration,
  } = useRegistrationLogic();

  return {
    // État
    formData,
    currentStep,
    isLoading,
    errors,
    globalError,
    isSubmitting,
    emailVerificationCode,
    isEmailVerified,
    selectedImages,
    
    // Actions d'état simple
    updateField,
    toggleTag,
    resetForm,
    clearGlobalError,
    setEmailVerificationCode,
    
    // Logique métier
    validateCurrentStep,
    canContinue,
    nextStep,
    prevStep,
    sendEmailVerification,
    verifyEmail,
    submitRegistration,
    completeRegistration,
  };
}