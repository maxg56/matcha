export const useNotifications = () => {
  const dispatchUploadEvent = (type: string, message: string, extra: Record<string, unknown> = {}) => {
    const event = new CustomEvent('smash-upload-notification', {
      detail: { type, message, ...extra }
    });
    window.dispatchEvent(event);
  };

  const dispatchProfileEvent = (type: string, message: string, error?: string) => {
    const event = new CustomEvent('profile-completion-notification', {
      detail: { type, message, error }
    });
    window.dispatchEvent(event);
  };

  return {
    dispatchUploadEvent,
    dispatchProfileEvent,
  };
};