import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistrationStore } from '@/stores/registrationStore';

export function useRegistration() {
  const navigate = useNavigate();
  const {
    formData,
    currentStep,
    isLoading,
    errors,
    globalError,
    isSubmitting,
    updateField,
    toggleTag,
    validateStep,
    canContinue,
    nextStep,
    prevStep,
    submitRegistration: storeSubmitRegistration,
    completeRegistration,
    resetForm,
    checkUsernameAvailability,
    checkEmailAvailability,
    clearGlobalError,
  } = useRegistrationStore();

  const submitRegistration = useCallback(async () => {
    try {
      await storeSubmitRegistration();
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    }
  }, [storeSubmitRegistration, navigate]);

  return {
    formData,
    currentStep,
    isLoading,
    errors,
    globalError,
    isSubmitting,
    updateField,
    toggleTag,
    validateStep,
    canContinue,
    nextStep,
    prevStep,
    submitRegistration,
    completeRegistration,
    resetForm,
    checkUsernameAvailability,
    checkEmailAvailability,
    clearGlobalError,
  };
}