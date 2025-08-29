import { useNavigate } from 'react-router-dom';
import { attemptTokenRefresh } from '@/utils/smashNotifications';

export const useTokenRefresh = () => {
  const navigate = useNavigate();
  
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
      navigate('/login');
    }, 3000);
    
    return false;
  };

  return { handleTokenExpiration };
};