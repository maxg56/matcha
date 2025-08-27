import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistrationStore } from '@/stores/registrationStore';
import { useImageUpload } from './useImageUpload';

export function useRegistration() {
  const navigate = useNavigate();
  const {
    formData,
    currentStep,
    isLoading,
    errors,
    globalError,
    isSubmitting,
    emailVerificationCode,
    isEmailVerified,
    updateField,
    toggleTag,
    validateCurrentStep,
    canContinue,
    nextStep,
    prevStep,
    submitRegistration: storeSubmitRegistration,
    completeRegistration: storeCompleteRegistration,
    resetForm,
    clearGlobalError,
    setEmailVerificationCode,
    sendEmailVerification,
    verifyEmail,
  } = useRegistrationStore();
  const { handleUpload } = useImageUpload();

  const submitRegistration = useCallback(async () => {
    try {
      await storeSubmitRegistration();
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    }
  }, [storeSubmitRegistration, navigate]);

  const completeRegistration = useCallback(async () => {
    try {
      await handleUpload();
      await storeCompleteRegistration();
    } catch (err) {
      console.error('Profile completion failed:', err);
      throw err;
    }
  }, [storeCompleteRegistration]);

  return {
    formData,
    currentStep,
    isLoading,
    errors,
    globalError,
    isSubmitting,
    emailVerificationCode,
    isEmailVerified,
    updateField,
    toggleTag,
    validateCurrentStep,
    canContinue,
    nextStep,
    prevStep,
    submitRegistration,
    completeRegistration,
    resetForm,
    clearGlobalError,
    setEmailVerificationCode,
    sendEmailVerification,
    verifyEmail,
  };
}