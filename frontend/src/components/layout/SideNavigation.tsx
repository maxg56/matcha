import { Heart, MessageCircle, Search, User, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Découvrir',
    icon: Search,
    href: '/discover',
  },
  {
    label: 'Likes',
    icon: Heart,
    href: '/matches',
  },
  {
    label: 'Messages',
    icon: MessageCircle,
    href: '/messages',
  },
  {
    label: 'Profil',
    icon: User,
    href: '/profile',
  },
];

const mockUser = {
  name: 'Alex',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  initials: 'AL'
};

export function SideNavigation() {
  const location = useLocation();

  return (
    <aside className="w-80 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white bg-primary rounded-2xl flex items-center justify-center">
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
      <nav className="flex-1 p-4">
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
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                <span className="font-medium">{item.label}</span>
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
      <div className="p-4 border-t border-border space-y-2">
        <Link to="/settings">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
            Paramètres
          </Button>
        </Link>
        
        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}