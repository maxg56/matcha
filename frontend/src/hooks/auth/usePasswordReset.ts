import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PasswordService } from '@/services/passwordService';
import { PasswordValidator } from '@/utils/passwordValidator';

interface PasswordResetFormData {
  password: string;
  confirmPassword: string;
}

export function usePasswordReset() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState<PasswordResetFormData>({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de réinitialisation manquant ou invalide');
    }
  }, [token]);

  const validatePassword = (password: string): string | undefined => {
    const result = PasswordValidator.validate(password);
    if (!result.isValid && result.errors.length > 0) {
      return result.errors[0];
    }
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword.trim()) {
      return 'Veuillez confirmer votre mot de passe';
    }
    if (confirmPassword !== password) {
      return 'Les mots de passe ne correspondent pas';
    }
    return undefined;
  };

  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, password: value }));
    setError('');

    const passwordError = validatePassword(value);
    setFieldErrors(prev => ({
      ...prev,
      password: passwordError
    }));

    // Also revalidate confirm password if it has been entered
    if (formData.confirmPassword) {
      const confirmError = validateConfirmPassword(formData.confirmPassword, value);
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, confirmPassword: value }));
    setError('');

    const confirmError = validateConfirmPassword(value, formData.password);
    setFieldErrors(prev => ({
      ...prev,
      confirmPassword: confirmError
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Token de réinitialisation manquant');
      return;
    }

    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

    const validationErrors = {
      password: passwordError,
      confirmPassword: confirmPasswordError
    };

    setFieldErrors(validationErrors);

    if (passwordError || confirmPasswordError) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await PasswordService.resetPassword(token, formData.password);
      setIsSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    navigate('/connexion');
  };

  const handleRequestNewLink = () => {
    navigate('/mot-de-passe-oublie');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isFormValid = !!(
    formData.password &&
    formData.confirmPassword &&
    token &&
    !fieldErrors.password &&
    !fieldErrors.confirmPassword
  );

  return {
    token,
    formData,
    showPassword,
    showConfirmPassword,
    isLoading,
    error,
    fieldErrors,
    isSuccess,
    isFormValid,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
    handleNavigateToLogin,
    handleRequestNewLink,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  };
}