import { useState } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Bell, 
  Shield, 
  Eye, 
  Heart, 
  MapPin, 
  Calendar,
  Edit3,
  Camera,
  Trash2,
  LogOut,
  Crown,
  Zap,
  Star,
  ChevronRight,
  Globe,
  Moon,
  Volume2,
  Vibrate
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

function SettingItem({ icon, title, description, children, onClick, className }: SettingItemProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 hover:bg-accent/50 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="text-muted-foreground">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
      {onClick && !children && (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-3 px-4">{title}</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

const mockUser = {
  name: 'Alex Martin',
  age: 26,
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  location: 'Paris, France',
  verified: true,
  premium: false
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    likes: true,
    superLikes: false,
    push: true,
    email: false,
    sound: true,
    vibration: true
  });

  const [privacy, setPrivacy] = useState({
    showAge: true,
    showDistance: true,
    onlineStatus: false,
    readReceipts: true,
    profileVisibility: true
  });

  const [discovery, setDiscovery] = useState({
    ageRange: [22, 35],
    distance: [25],
    showMe: 'women' // 'women', 'men', 'everyone'
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: 'Français',
    autoPlay: true
  });

  return (
    <ResponsiveLayout
      title="Paramètres"
      showNavigation={true}
      maxWidth="lg"
    >
      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <SettingSection title="Mon Profil">
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                  <AvatarFallback>AM</AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90">
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{mockUser.name}, {mockUser.age}</h3>
                  {mockUser.verified && (
                    <Badge variant="default" className="bg-blue-500 text-white text-xs">
                      Vérifié
                    </Badge>
                  )}
                  {mockUser.premium && (
                    <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {mockUser.location}
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit3 className="h-4 w-4" />
                Modifier
              </Button>
            </div>
          </div>
          
          <div className="border-t border-border">
            <SettingItem
              icon={<User className="h-4 w-4" />}
              title="Informations personnelles"
              description="Age, occupation, bio, intérêts"
              onClick={() => navigate('/settings/complete')}
            />
            <SettingItem
              icon={<Camera className="h-4 w-4" />}
              title="Photos"
              description="Gérer vos photos de profil"
              onClick={() => console.log('Manage photos')}
            />
            <SettingItem
              icon={<Shield className="h-4 w-4" />}
              title="Vérification"
              description="Vérifiez votre profil avec une photo"
              onClick={() => console.log('Verify profile')}
            />
          </div>
        </SettingSection>

        {/* Discovery Preferences */}
        <SettingSection title="Préférences de Découverte">
          <SettingItem
            icon={<Heart className="h-4 w-4" />}
            title="Qui souhaitez-vous voir ?"
            description={discovery.showMe === 'women' ? 'Femmes' : discovery.showMe === 'men' ? 'Hommes' : 'Tout le monde'}
            onClick={() => console.log('Change show me preference')}
          />
          
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h3 className="font-medium text-foreground">Tranche d'âge</h3>
                  <p className="text-sm text-muted-foreground">
                    {discovery.ageRange[0]} - {discovery.ageRange[1]} ans
                  </p>
                </div>
              </div>
            </div>
            <Slider
              value={discovery.ageRange}
              min={18}
              max={65}
              step={1}
              onValueChange={(value) => setDiscovery({...discovery, ageRange: value})}
              className="mb-4"
            />
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h3 className="font-medium text-foreground">Distance maximale</h3>
                  <p className="text-sm text-muted-foreground">
                    {discovery.distance[0]} km
                  </p>
                </div>
              </div>
            </div>
            <Slider
              value={discovery.distance}
              min={1}
              max={100}
              step={1}
              onValueChange={(value) => setDiscovery({...discovery, distance: value})}
            />
          </div>
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="Notifications">
          <SettingItem
            icon={<Heart className="h-4 w-4" />}
            title="Nouveaux likes"
            description="Être notifié quand quelqu'un vous like"
          >
            <Switch 
              checked={notifications.likes}
              onCheckedChange={(checked) => setNotifications({...notifications, likes: checked})}
            />
          </SettingItem>

          <SettingItem
            icon={<Star className="h-4 w-4" />}
            title="Super Likes"
            description="Être notifié des Super Likes reçus"
          >
            <Switch 
              checked={notifications.superLikes}
              onCheckedChange={(checked) => setNotifications({...notifications, superLikes: checked})}
            />
          </SettingItem>

          <SettingItem
            icon={<Bell className="h-4 w-4" />}
            title="Messages"
            description="Nouvelles conversations et messages"
          >
            <Switch 
              checked={notifications.messages}
              onCheckedChange={(checked) => setNotifications({...notifications, messages: checked})}
            />
          </SettingItem>

          <SettingItem
            icon={<Volume2 className="h-4 w-4" />}
            title="Sons"
            description="Sons de notification"
          >
            <Switch 
              checked={notifications.sound}
              onCheckedChange={(checked) => setNotifications({...notifications, sound: checked})}
            />
          </SettingItem>

          <SettingItem
            icon={<Vibrate className="h-4 w-4" />}
            title="Vibrations"
            description="Vibrations pour les notifications"
          >
            <Switch 
              checked={notifications.vibration}
              onCheckedChange={(checked) => setNotifications({...notifications, vibration: checked})}
            />
          </SettingItem>
        </SettingSection>

        {/* Privacy & Safety */}
        <SettingSection title="Confidentialité et Sécurité">
          <SettingItem
            icon={<Eye className="h-4 w-4" />}
            title="Statut en ligne"
            description="Montrer quand vous êtes en ligne"
          >
            <Switch 
              checked={privacy.onlineStatus}
              onCheckedChange={(checked) => setPrivacy({...privacy, onlineStatus: checked})}
            />
          </SettingItem>

          <SettingItem
            icon={<Calendar className="h-4 w-4" />}
            title="Afficher mon âge"
            description="Visible sur votre profil"
          >
            <Switch 
              checked={privacy.showAge}
              onCheckedChange={(checked) => setPrivacy({...privacy, showAge: checked})}
            />
          </SettingItem>

          <SettingItem
            icon={<MapPin className="h-4 w-4" />}
            title="Afficher la distance"
            description="Montrer votre distance approximative"
          >
            <Switch 
              checked={privacy.showDistance}
              onCheckedChange={(checked) => setPrivacy({...privacy, showDistance: checked})}
            />
          </SettingItem>

          <SettingItem
            icon={<Shield className="h-4 w-4" />}
            title="Profils bloqués"
            description="Gérer les utilisateurs bloqués"
            onClick={() => console.log('Manage blocked profiles')}
          />

          <SettingItem
            icon={<Trash2 className="h-4 w-4" />}
            title="Supprimer le compte"
            description="Supprimer définitivement votre compte"
            onClick={() => console.log('Delete account')}
            className="text-destructive"
          />
        </SettingSection>

        {/* App Preferences */}
        <SettingSection title="Préférences de l'App">
          <SettingItem
            icon={<Moon className="h-4 w-4" />}
            title="Mode sombre"
            description="Interface sombre pour vos yeux"
          >
            <Switch 
              checked={preferences.darkMode}
              onCheckedChange={(checked) => setPreferences({...preferences, darkMode: checked})}
            />
          </SettingItem>

          <SettingItem
            icon={<Globe className="h-4 w-4" />}
            title="Langue"
            description={preferences.language}
            onClick={() => console.log('Change language')}
          />
        </SettingSection>

        {/* Premium */}
        {!mockUser.premium && (
          <SettingSection title="Premium">
            <div className="p-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-white mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5" />
                  <h3 className="font-semibold">Matcha Premium</h3>
                </div>
                <p className="text-sm opacity-90 mb-3">
                  Débloquez toutes les fonctionnalités premium pour une expérience optimale
                </p>
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  Découvrir Premium
                </Button>
              </div>
            </div>
            
            <SettingItem
              icon={<Zap className="h-4 w-4" />}
              title="Boost"
              description="Soyez vu par plus de personnes"
              onClick={() => console.log('Purchase boost')}
            />

            <SettingItem
              icon={<Star className="h-4 w-4" />}
              title="Super Likes"
              description="Montrez votre intérêt spécial"
              onClick={() => console.log('Purchase super likes')}
            />
          </SettingSection>
        )}

        {/* Account Actions */}
        <SettingSection title="Compte">
          <SettingItem
            icon={<LogOut className="h-4 w-4" />}
            title="Se déconnecter"
            onClick={() => console.log('Logout')}
            className="text-destructive"
          />
        </SettingSection>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground pt-4 pb-8">
          <p>Matcha v1.0.0</p>
          <p className="mt-1">© 2024 Matcha. Tous droits réservés.</p>
        </div>
      </div>
    </ResponsiveLayout>
  );
}