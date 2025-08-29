import { useEffect } from 'react';
import { useSmashNotifications } from '@/utils/smashNotifications';

/**
 * Hook to handle profile completion notifications
 * Listens for profile-completion events and displays appropriate notifications
 */
export function useProfileNotifications() {
  const smashNotifier = useSmashNotifications();

  useEffect(() => {
    const handleProfileNotification = (event: CustomEvent) => {
      const { type, message, error } = event.detail;

      switch (type) {
        case 'tags_error':
          // Show warning that tags failed but user can continue
          smashNotifier.notifyProfileError('failed to update tags', true);
          break;

        case 'profile_partial_success':
          // Show warning that profile was created with issues
          smashNotifier.notifyProfilePartialSuccess([message]);
          break;

        case 'profile_server_error':
          // Show server error with retry suggestion
          smashNotifier.notifyProfileError('server error');
          break;

        default:
          // Generic profile error
          smashNotifier.notifyCustom('error', message, {
            title: 'Erreur de profil',
            duration: 6000
          });
      }
    };

    // Listen for profile completion events
    window.addEventListener('profile-completion-notification', handleProfileNotification as EventListener);

    return () => {
      window.removeEventListener('profile-completion-notification', handleProfileNotification as EventListener);
    };
  }, [smashNotifier]);

  return {
    // Could return additional methods if needed
    notifyTagsError: () => smashNotifier.notifyProfileError('failed to update tags', true),
    notifyServerError: () => smashNotifier.notifyProfileError('server error'),
    notifyPartialSuccess: (warnings: string[]) => smashNotifier.notifyProfilePartialSuccess(warnings)
  };
}

/**
 * Custom event types for profile completion notifications
 */
export interface ProfileNotificationDetail {
  type: 'tags_error' | 'profile_partial_success' | 'profile_server_error' | 'generic_error';
  message: string;
  error?: string;
  canContinue?: boolean;
}