import { useToast } from '@/hooks';

export interface SmashUploadStatus {
  type: 'upload_start' | 'upload_progress' | 'upload_success' | 'upload_error';
  message: string;
  userId?: string;
  imageCount?: number;
  totalImages?: number;
  error?: string;
}

/**
 * Utility system for smash upload notifications
 * Provides centralized notification handling for image upload operations
 */
export class SmashNotificationSystem {
  private toastInstance: ReturnType<typeof useToast> | null = null;
  
  constructor(toast?: ReturnType<typeof useToast>) {
    this.toastInstance = toast || null;
  }

  /**
   * Send notification when upload starts
   */
  notifyUploadStart(imageCount: number): void {
    const message = imageCount === 1 
      ? 'Upload de votre photo en cours...' 
      : `Upload de ${imageCount} photos en cours...`;
    
    this.toastInstance?.info(message, { duration: 3000 });
    
    // Also send to notification system if available
    this.sendToNotificationSystem({
      type: 'upload_start',
      message,
      imageCount
    });
  }

  /**
   * Send notification for upload progress
   */
  notifyUploadProgress(current: number, total: number): void {
    const message = `Upload en cours: ${current}/${total} photos`;
    
    this.toastInstance?.info(message, { duration: 2000 });
    
    this.sendToNotificationSystem({
      type: 'upload_progress',
      message,
      imageCount: current,
      totalImages: total
    });
  }

  /**
   * Send notification when upload succeeds
   */
  notifyUploadSuccess(imageCount: number): void {
    const message = imageCount === 1 
      ? 'Photo uploadée avec succès ! 🎉' 
      : `${imageCount} photos uploadées avec succès ! 🎉`;
    
    this.toastInstance?.success(message, { 
      title: 'Upload réussi',
      duration: 4000 
    });
    
    this.sendToNotificationSystem({
      type: 'upload_success',
      message,
      imageCount
    });
  }

  /**
   * Send notification when upload fails
   */
  notifyUploadError(error: string, imageCount?: number): void {
    let message = imageCount 
      ? `Erreur lors de l'upload de ${imageCount} photos: ${error}`
      : `Erreur lors de l'upload: ${error}`;
    
    // Handle specific error cases
    if (error.includes('token expired') || error.includes('unauthorized')) {
      message = 'Session expirée. Veuillez vous reconnecter pour continuer l\'upload.';
      this.toastInstance?.error(message, { 
        title: 'Session expirée',
        duration: 8000 
      });
      
      // Suggest re-login after a delay
      setTimeout(() => {
        this.toastInstance?.warning('Redirection vers la page de connexion...', { duration: 3000 });
      }, 2000);
      
    } else if (error.includes('network') || error.includes('fetch')) {
      message = 'Erreur de connexion. Vérifiez votre connexion internet.';
      this.toastInstance?.error(message, { 
        title: 'Erreur de connexion',
        duration: 6000 
      });
    } else {
      this.toastInstance?.error(message, { 
        title: 'Erreur d\'upload',
        duration: 6000 
      });
    }
    
    this.sendToNotificationSystem({
      type: 'upload_error',
      message,
      imageCount,
      error
    });
  }

  /**
   * Send notification for profile completion issues
   */
  notifyProfileError(error: string, canContinue: boolean = false): void {
    let message = `Erreur de profil: ${error}`;
    let title = 'Erreur de profil';
    let duration = 6000;
    
    if (error.includes('failed to update tags')) {
      message = 'Erreur lors de la mise à jour des centres d\'intérêt. Vous pouvez les modifier plus tard.';
      title = 'Centres d\'intérêt';
      if (canContinue) {
        this.toastInstance?.warning(message, { title, duration: 5000 });
        return;
      }
    } else if (error.includes('server error') || error.includes('500')) {
      message = 'Erreur serveur temporaire. Veuillez réessayer dans quelques instants.';
      title = 'Erreur serveur';
      duration = 7000;
    }
    
    this.toastInstance?.error(message, { title, duration });
    
    this.sendToNotificationSystem({
      type: 'upload_error',
      message,
      error
    });
  }

  /**
   * Send notification for successful profile completion with warnings
   */
  notifyProfilePartialSuccess(warnings: string[]): void {
    const message = warnings.length === 1 
      ? `Profil créé avec un avertissement: ${warnings[0]}`
      : `Profil créé avec quelques avertissements. Vérifiez vos paramètres.`;
    
    this.toastInstance?.warning(message, { 
      title: 'Profil créé',
      duration: 6000 
    });
  }

  /**
   * Send custom smash notification
   */
  notifyCustom(
    variant: 'success' | 'error' | 'warning' | 'info',
    message: string,
    options?: { title?: string; duration?: number }
  ): void {
    if (!this.toastInstance) return;
    
    const method = this.toastInstance[variant];
    method(message, options);
  }

  /**
   * Private method to send to the main notification system
   * This integrates with the existing EventSource notification system
   */
  private sendToNotificationSystem(status: SmashUploadStatus): void {
    try {
      // Send to backend notification service if needed
      // This could integrate with the notify-service mentioned in CLAUDE.md
      console.log('[SmashNotificationSystem]', status);
      
      // You could also dispatch custom events that the main app listens to
      const event = new CustomEvent('smash-upload-notification', { 
        detail: status 
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
}

/**
 * Hook to get a configured SmashNotificationSystem instance
 */
export function useSmashNotifications(): SmashNotificationSystem {
  const toast = useToast();
  return new SmashNotificationSystem(toast);
}

/**
 * Utility function for quick notifications without hook dependency
 */
export function createSmashNotifier(): SmashNotificationSystem {
  return new SmashNotificationSystem();
}

/**
 * Handle token refresh attempt during upload
 */
export async function attemptTokenRefresh(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return false;
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refreshToken', data.refresh_token);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

/**
 * Pre-configured notification messages for common scenarios
 */
export const SMASH_MESSAGES = {
  // Upload messages
  UPLOAD_START: (count: number) => 
    count === 1 ? 'Upload de votre photo...' : `Upload de ${count} photos...`,
  
  UPLOAD_SUCCESS: (count: number) => 
    count === 1 ? 'Photo uploadée ! 🎉' : `${count} photos uploadées ! 🎉`,
  
  UPLOAD_ERROR: (error: string) => 
    `Erreur d'upload: ${error}`,
  
  // File validation messages
  INVALID_FILE: 'Format de fichier non supporté',
  FILE_TOO_LARGE: 'Fichier trop volumineux (max 10MB)',
  
  // Network and server messages
  NETWORK_ERROR: 'Erreur réseau, veuillez réessayer',
  SERVER_ERROR: 'Erreur serveur, veuillez réessayer plus tard',
  
  // Authentication messages
  TOKEN_EXPIRED: 'Session expirée. Reconnexion nécessaire.',
  TOKEN_REFRESHED: 'Session renouvelée. Upload en cours...',
  TOKEN_REFRESH_ATTEMPT: 'Session expirée. Tentative de renouvellement...',
  
  // Profile completion messages
  PROFILE_TAGS_ERROR: 'Impossible de sauvegarder vos centres d\'intérêt. Vous pourrez les modifier plus tard dans votre profil.',
  PROFILE_SERVER_ERROR: 'Erreur serveur lors de la création du profil. Veuillez réessayer.',
  PROFILE_PARTIAL_SUCCESS: 'Profil créé avec quelques avertissements. Vérifiez vos paramètres.',
  PROFILE_COMPLETION_RETRY: 'Nouvel essai de création du profil...',
  
  // Generic messages
  CONTINUE_ANYWAY: 'Vous pouvez continuer, cette erreur n\'est pas bloquante.',
  TRY_AGAIN_LATER: 'Vous pourrez compléter cette information plus tard.',
} as const;