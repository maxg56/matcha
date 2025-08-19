import type { ReactNode } from 'react';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function TopBar({ title, showBack = false, onBack, rightAction }: TopBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
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
        
        <div className="flex items-center">
          {rightAction || (
            <Button variant="ghost" size="sm" className="p-2 hover:bg-accent">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}