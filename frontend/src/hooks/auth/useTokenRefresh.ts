import { attemptTokenRefresh } from '@/utils/smashNotifications';

export const useTokenRefresh = () => {
  const handleTokenExpiration = async (retryFn: () => Promise<void>) => {
    const refreshSuccess = await attemptTokenRefresh();
    
    if (refreshSuccess) {
      try {
        await retryFn();
        return true;
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    }
    
    // Clear tokens and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 3000);
    
    return false;
  };

  return { handleTokenExpiration };
};