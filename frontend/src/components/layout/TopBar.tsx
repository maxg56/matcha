import type { ReactNode } from 'react';
import { ArrowLeft, MoreHorizontal, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/';
import { NotificationButton } from '../Notifications';
import { PremiumIndicator, usePremiumStatus } from '../premium/PremiumIndicator';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  showAuthActions?: boolean;
}

export function TopBar({ title, showBack = false, onBack, rightAction, showAuthActions = false }: TopBarProps) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { isPremium, isLoading: isPremiumLoading } = usePremiumStatus();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <header className="flex-shrink-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between h-14 px-4 bg-white dark:bg-gray-800"> 
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2 hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-foreground truncate">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {showAuthActions && (
            <>
              <NotificationButton />
              {isPremium && !isPremiumLoading && (
                <PremiumIndicator variant="crown" size="sm" />
              )}
              {user && (
                <span className="text-xs text-muted-foreground max-w-20 truncate">
                  {user.username}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="p-2 hover:bg-destructive/10 text-destructive hover:text-destructive"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
          {rightAction || (!showAuthActions && (
            <Button variant="ghost" size="sm" className="p-2 hover:bg-accent">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
}