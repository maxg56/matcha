import type { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { TopBar } from './TopBar';

interface AppLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  title?: string;
}

export function AppLayout({ children, showNavigation = true, title }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {title && <TopBar title={title} />}
      
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
      
      {showNavigation && <BottomNavigation />}
    </div>
  );
}