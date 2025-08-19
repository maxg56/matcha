import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 dark:text-gray-400">Chargement...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated 
    ? <Navigate to="/app/discover" replace />
    : <Navigate to="/login" replace />;
};