import { useCallback } from 'react';
import { useToast } from './ui/useToast';
import { ErrorHandler } from '@/utils/errorHandler';

/**
 * Hook pour gérer les erreurs d'inscription avec des toasts appropriés
 */
export function useRegistrationErrors() {
  const { success, error: showError, warning, info } = useToast();

  /**
   * Gère les erreurs critiques avec des toasts
   */
  const handleCriticalError = useCallback((error: string | Error, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const { globalError } = ErrorHandler.parseAPIError(errorMessage, 'registration');

    // Afficher un toast pour les erreurs critiques
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      showError(
        'Vérifiez votre connexion internet et réessayez.',
        { title: '🌐 Problème de connexion', duration: 8000 }
      );
    } else if (errorMessage.includes('server') || errorMessage.includes('500')) {
      showError(
        'Nos serveurs rencontrent des difficultés. Veuillez réessayer dans quelques instants.',
        { title: '⚠️ Erreur serveur', duration: 8000 }
      );
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('trop de tentatives')) {
      warning(
        'Attendez quelques minutes avant de réessayer.',
        { title: '🚫 Trop de tentatives', duration: 10000 }
      );
    } else if (errorMessage.includes('token') && errorMessage.includes('expired')) {
      showError(
        'Votre session a expiré. Vous allez être redirigé vers la page de connexion.',
        { title: '🔐 Session expirée', duration: 5000 }
      );
    } else if (context === 'email_verification') {
      showError(
        globalError || 'Impossible de vérifier votre email. Vérifiez le code ou demandez un nouveau code.',
        { title: '📧 Vérification email échouée', duration: 8000 }
      );
    } else if (context === 'image_upload') {
      showError(
        'Impossible de télécharger vos photos. Vérifiez le format et la taille des fichiers.',
        { title: '📸 Erreur d\'upload', duration: 8000 }
      );
    } else if (context === 'profile_completion') {
      showError(
        globalError || 'Impossible de finaliser votre profil. Vérifiez vos informations.',
        { title: '👤 Finalisation du profil échouée', duration: 8000 }
      );
    } else {
      // Erreur générique
      showError(
        globalError || 'Une erreur s\'est produite. Veuillez réessayer.',
        { title: '❌ Erreur inattendue', duration: 6000 }
      );
    }
  }, [showError, warning]);

  /**
   * Affiche des messages de succès
   */
  const showSuccess = useCallback((title: string, message?: string) => {
    success(message || title, { title, duration: 4000 });
  }, [success]);

  /**
   * Affiche des messages d'information
   */
  const showInfo = useCallback((title: string, message?: string) => {
    info(message || title, { title, duration: 5000 });
  }, [info]);

  /**
   * Affiche des avertissements
   */
  const showWarning = useCallback((title: string, message?: string) => {
    warning(message || title, { title, duration: 6000 });
  }, [warning]);

  return {
    handleCriticalError,
    showSuccess,
    showInfo,
    showWarning,
  };
}