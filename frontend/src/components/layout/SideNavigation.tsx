import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Search, User, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
];

type MockUser = {
  name: string;
  avatar: string;
  initials: string;
};

export function SideNavigation() {
  const location = useLocation();
  const { logout, user } = useAuth();
  
  const [mockUser, setMockUser] = useState<MockUser>({
    name: 'Alex',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    initials: 'AL'
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  useEffect(() => {
    if (user) {
      setMockUser({
        name: user.username || 'Utilisateur',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        initials: user.username ? user.username.substring(0, 2).toUpperCase() : 'U'
      });
    }
  }, [user]);
  return (
    <aside className="w-80 h-full bg-card border-r border-border flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white bg-primary rounded-full flex items-center justify-center">
            <img src="/public/EmojiMatcha.png" 
              className="h-12 w-12  text-primary-foreground fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Matcha</h1>
            <p className="text-sm text-muted-foreground">Trouvez l'amour</p>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-background/50 hover:bg-accent/50 transition-colors cursor-pointer">
          <Avatar className="w-10 h-10">
            <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {mockUser.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{mockUser.name}</p>
            <p className="text-sm text-muted-foreground">En ligne</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                  "hover:bg-accent/50 active:scale-[0.98]",
                  isActive 
                    ? "bg-chart-5 text-primary-foreground shadow-lg shadow-primary/25 hover:bg-gray-800/100" 
                    : "text-muted-foreground hover:text-secondary-foreground text-white"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-200 text-primary",
                  isActive && "scale-110"
                )} />
                <span className="font-medium text-primary">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-8 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
          <h3 className="font-semibold text-foreground mb-3">Mes stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Matches</span>
              <span className="font-semibold text-primary">24</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vues de profil</span>
              <span className="font-semibold text-primary">156</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Likes reçus</span>
              <span className="font-semibold text-primary">89</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2 flex-shrink-0">
        <Link to="/app/settings">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
            Paramètres
          </Button>
        </Link>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}