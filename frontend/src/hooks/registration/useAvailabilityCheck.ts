import { useState } from 'react';
import { authService } from '@/services/auth';
import { ErrorHandler } from '@/utils/errorHandler';

export const useAvailabilityCheck = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkAvailability = async (
    field: 'username' | 'email',
    value: string,
    checkFunction: (value: string) => Promise<{ available: boolean; message?: string }>
  ): Promise<{ available: boolean; error?: string }> => {
    setIsChecking(true);
    
    try {
      const response = await checkFunction(value);
      
      if (!response.available) {
        const error = response.message || `Ce ${field === 'username' ? 'pseudo' : 'email'} n'est pas disponible`;
        return { available: false, error };
      }
      
      return { available: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Erreur lors de la vérification du ${field}`;
      const { fieldErrors } = ErrorHandler.parseAPIError(errorMessage, 'registration');
      
      return {
        available: false,
        error: fieldErrors[field] || `Erreur lors de la vérification du ${field}`
      };
    } finally {
      setIsChecking(false);
    }
  };

  const checkUsernameAvailability = (username: string) => 
    checkAvailability('username', username, authService.checkUsernameAvailability);

  const checkEmailAvailability = (email: string) => 
    checkAvailability('email', email, authService.checkEmailAvailability);

  return {
    isChecking,
    checkUsernameAvailability,
    checkEmailAvailability,
  };
};