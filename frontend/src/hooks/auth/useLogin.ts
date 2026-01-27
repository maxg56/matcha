import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth';
import { ErrorHandler } from '@/utils/errorHandler';

interface LoginFormData {
  login: string; // pseudo ou email
  password: string;
}

export function useLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Récupérer le message d'erreur depuis l'URL au chargement
  useEffect(() => {
    const errorFromUrl = searchParams.get('error');
    if (errorFromUrl) {
      setError(decodeURIComponent(errorFromUrl));
      // Nettoyer l'URL après avoir récupéré l'erreur
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('error');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
      default:
        return undefined;
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // // Clear errors when user starts typing
    // if (error) setError('');
    
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
    setFieldErrors({});

    try {
      await login(formData.login, formData.password);
      navigate('/app/discover');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      const { globalError } = ErrorHandler.parseAPIError(errorMessage, 'login');
      navigateToLoginWithError(globalError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/mot-de-passe-oublie');
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


  const navigateToLoginWithError = (errorMessage: string) => {
    navigate(`/connexion?error=${encodeURIComponent(errorMessage)}`);
  };

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
    navigateToLoginWithError,
  };
}
