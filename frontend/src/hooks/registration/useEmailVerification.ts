import { useState } from 'react';
import { authService } from '@/services/auth';
import { ErrorHandler } from '@/utils/errorHandler';

export const useEmailVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const sendEmailVerification = async (email: string) => {
    setIsLoading(true);
    try {
      await authService.sendEmailVerification(email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du code';
      const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'registration');
      throw { fieldErrors, globalError: globalError || 'Erreur lors de l\'envoi du code de vérification' };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      await authService.verifyEmail(email, code);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Code de vérification invalide';
      const { fieldErrors, globalError } = ErrorHandler.parseAPIError(errorMessage, 'registration');
      throw { fieldErrors, globalError: globalError || 'Code de vérification invalide' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    verificationCode,
    setVerificationCode,
    sendEmailVerification,
    verifyEmail,
  };
};