import { useToast } from '@/hooks/useToast';

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
    const message = imageCount 
      ? `Erreur lors de l'upload de ${imageCount} photos: ${error}`
      : `Erreur lors de l'upload: ${error}`;
    
    this.toastInstance?.error(message, { 
      title: 'Erreur d\'upload',
      duration: 6000 
    });
    
    this.sendToNotificationSystem({
      type: 'upload_error',
      message,
      imageCount,
      error
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
 * Pre-configured notification messages for common scenarios
 */
export const SMASH_MESSAGES = {
  UPLOAD_START: (count: number) => 
    count === 1 ? 'Upload de votre photo...' : `Upload de ${count} photos...`,
  
  UPLOAD_SUCCESS: (count: number) => 
    count === 1 ? 'Photo uploadée ! 🎉' : `${count} photos uploadées ! 🎉`,
  
  UPLOAD_ERROR: (error: string) => 
    `Erreur d'upload: ${error}`,
  
  INVALID_FILE: 'Format de fichier non supporté',
  FILE_TOO_LARGE: 'Fichier trop volumineux (max 10MB)',
  NETWORK_ERROR: 'Erreur réseau, veuillez réessayer',
  SERVER_ERROR: 'Erreur serveur, veuillez réessayer plus tard'
} as const;