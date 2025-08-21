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
    isSubmitting,
    updateField,
    toggleTag,
    validateStep,
    canContinue,
    nextStep,
    prevStep,
    submitRegistration: storeSubmitRegistration,
    resetForm,
    checkUsernameAvailability,
    checkEmailAvailability,
  } = useRegistrationStore();

  const submitRegistration = useCallback(async () => {
    try {
      await storeSubmitRegistration();
      navigate('/app/discover');
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
    isSubmitting,
    updateField,
    toggleTag,
    validateStep,
    canContinue,
    nextStep,
    prevStep,
    submitRegistration,
    resetForm,
    checkUsernameAvailability,
    checkEmailAvailability,
  };
}