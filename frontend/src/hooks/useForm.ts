import { useState } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | undefined;
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Partial<Record<keyof T, ValidationRule>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = (name: keyof T, value: any): string | undefined => {
    const rules = validationRules?.[name];
    if (!rules) return undefined;

    if (rules.required && (!value || value.toString().trim() === '')) {
      return 'Ce champ est requis';
    }

    if (rules.minLength && value.toString().length < rules.minLength) {
      return `Minimum ${rules.minLength} caractères requis`;
    }

    if (rules.maxLength && value.toString().length > rules.maxLength) {
      return `Maximum ${rules.maxLength} caractères autorisés`;
    }

    if (rules.pattern && !rules.pattern.test(value.toString())) {
      return 'Format invalide';
    }

    if (rules.custom) {
      return rules.custom(value.toString());
    }

    return undefined;
  };

  const setValue = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validate on change if field was already touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const setFieldTouched = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let hasErrors = false;

    Object.keys(values).forEach(key => {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Partial<Record<keyof T, boolean>>)
    );

    return !hasErrors;
  };

  const reset = (newValues?: T) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
  };

  const getFieldProps = (name: keyof T) => ({
    value: values[name] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      setValue(name, e.target.value),
    onBlur: () => setFieldTouched(name),
    error: touched[name] ? errors[name] : undefined,
  });

  const isValid = Object.keys(errors).length === 0;
  const hasAnyTouched = Object.values(touched).some(Boolean);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    getFieldProps,
    isValid,
    hasAnyTouched,
  };
}
