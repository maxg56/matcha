import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { TopBar } from './TopBar';
import { SideNavigation } from './SideNavigation';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  title?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function ResponsiveLayout({ 
  children, 
  showNavigation = true, 
  title,
  maxWidth = 'full'
}: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-none'
  };

  if (isMobile) {
    // Mobile Layout
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {title && <TopBar title={title} />}
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
        
        {showNavigation && <BottomNavigation />}
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen flex bg-background">
      {showNavigation && <SideNavigation />}
      
      <div className="flex-1 flex flex-col">
        {title && (
          <header className="border-b border-border bg-background/80 backdrop-blur-md">
            <div className={cn("mx-auto px-6 py-4", maxWidthClasses[maxWidth])}>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            </div>
          </header>
        )}
        
        <main className="flex-1 overflow-hidden">
          <div className={cn("mx-auto h-full", maxWidthClasses[maxWidth])}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}