import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ErrorHandler } from '@/utils/errorHandler';
import { PasswordValidator } from '@/utils/passwordValidator';

interface LoginFormData {
  login: string; // pseudo ou email
  password: string;
}

export function useLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    login: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    login?: string;
    password?: string;
  }>({});

  const validateField = (field: keyof LoginFormData, value: string): string | undefined => {
    switch (field) {
      case 'login':
        if (!value.trim()) return 'Veuillez saisir votre pseudo ou email';
        if (value.includes('@') && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return 'Format d\'email invalide';
        }
        if (!value.includes('@') && value.length < 3) {
          return 'Le pseudo doit contenir au moins 3 caractères';
        }
        return undefined;
      case 'password':
        return PasswordValidator.validateForLogin(value);
      default:
        return undefined;
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (error) setError('');
    
    // Real-time field validation
    const fieldError = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: fieldError
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const loginError = validateField('login', formData.login);
    const passwordError = validateField('password', formData.password);
    
    const validationErrors = {
      login: loginError,
      password: passwordError
    };
    
    setFieldErrors(validationErrors);
    
    // Stop if there are validation errors
    if (loginError || passwordError) {
      return;
    }

    setIsLoading(true);
    setError('');
    setFieldErrors({});

    try {
      await login(formData.login, formData.password);
      navigate('/app/discover');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      const { fieldErrors: serverFieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'login');
      
      setFieldErrors(serverFieldErrors);
      setError(globalError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password');
  };

  const handleNavigateToSignup = () => {
    navigate('/inscription');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isEmail = (str: string) => {
    return str.includes('@');
  };

  const isFormValid = !!(formData.login && formData.password);

  return {
    formData,
    showPassword,
    isLoading,
    error,
    fieldErrors,
    isFormValid,
    isEmail,
    handleInputChange,
    handleSubmit,
    handleForgotPassword,
    handleNavigateToSignup,
    togglePasswordVisibility,
  };
}
