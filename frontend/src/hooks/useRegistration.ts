import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RegistrationData, FieldValidationErrors } from '@/types/registration';
import { defaultRegistrationData } from '@/types/registration';

export function useRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegistrationData>(defaultRegistrationData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldValidationErrors>({});

  const updateField = useCallback(<K extends keyof RegistrationData>(
    field: K, 
    value: RegistrationData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const toggleTag = useCallback((tag: string) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    updateField('tags', newTags);
  }, [formData.tags, updateField]);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: FieldValidationErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.username) newErrors.username = 'Pseudo requis';
        if (!formData.firstName) newErrors.firstName = 'Prénom requis';
        if (!formData.lastName) newErrors.lastName = 'Nom requis';
        if (!formData.email) newErrors.email = 'Email requis';
        if (!formData.password) newErrors.password = 'Mot de passe requis';
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
        break;
      case 2:
        if (!formData.birthDate) newErrors.birthDate = 'Date de naissance requise';
        if (!formData.gender) newErrors.gender = 'Genre requis';
        if (!formData.sexPref) newErrors.sexPref = 'Préférence requise';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const canContinue = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.username && formData.firstName && formData.lastName && 
                 formData.email && formData.password && formData.confirmPassword &&
                 formData.password === formData.confirmPassword);
      case 2:
        return !!(formData.birthDate && formData.gender && formData.sexPref);
      default:
        return true;
    }
  }, [formData]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const submitRegistration = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Registration data:', formData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate('/app/discover');
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [formData, navigate]);

  return {
    formData,
    currentStep,
    isLoading,
    errors,
    updateField,
    toggleTag,
    validateStep,
    canContinue,
    nextStep,
    prevStep,
    submitRegistration
  };
}