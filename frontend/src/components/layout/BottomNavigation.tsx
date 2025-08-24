import { Heart, MessageCircle, Search, User, Map } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Découvrir',
    icon: Search,
    href: '/app/discover',
  },
  {
    label: 'Likes',
    icon: Heart,
    href: '/app/matches',
  },
  {
    label: 'Messages',
    icon: MessageCircle,
    href: '/app/messages',
  },
  {
    label: 'Profil',
    icon: User,
    href: '/app/profile',
  },
  {
    label: 'Map',
    icon: Map,
    href: '/app/map',
  },
];

export function BottomNavigation() {
  const location = useLocation();
  
  // Don't show navigation on auth pages
  const authPages = ['/login', '/onboarding', '/Accueil', '/InscriptionPage'];
  if (authPages.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="flex-shrink-0 z-50 bg-card/80 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-200",
                "hover:bg-accent/50 active:scale-95",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}