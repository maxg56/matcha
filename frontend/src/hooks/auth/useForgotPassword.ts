import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordService } from '@/services/passwordService';

export function useForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Veuillez saisir votre adresse email';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return 'Format d\'email invalide';
    }
    return undefined;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await PasswordService.requestPasswordReset(email);
      setIsSuccess(true);
      setMessage(response.message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    navigate('/connexion');
  };

  const handleResendEmail = () => {
    setIsSuccess(false);
    setEmail('');
    setMessage('');
  };

  const isFormValid = !!email.trim();

  return {
    email,
    isLoading,
    error,
    isSuccess,
    message,
    isFormValid,
    handleEmailChange,
    handleSubmit,
    handleNavigateToLogin,
    handleResendEmail,
  };
}