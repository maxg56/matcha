import { Heart, MessageCircle, Search, User, Map, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks';

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
    label: 'Map',
    icon: Map,
    href: '/app/map',
  },
  {
    label: 'Profil',
    icon: User,
    href: '/app/profile',
  },
  {
    label: 'Log Out',
    icon: LogOut,
    href: '/app/logout',
  },
];

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

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

          if (item.label === 'Log Out') {
            return (
              <button
                key="logout"
                onClick={handleLogout}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-200 text-destructive hover:bg-destructive/10 active:scale-95"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">Log out</span>
              </button>
            );
          }

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
