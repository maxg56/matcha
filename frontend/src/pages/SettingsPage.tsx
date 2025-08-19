import { useState } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/useTheme';
import { 
  Bell, 
  Shield, 
  Eye, 
  Trash2,
  LogOut,
  Globe,
  Moon,
  Volume2,
  Vibrate,
  Star
} from 'lucide-react';
import { SettingItem, SettingSection, PremiumSection } from '@/components/settings';


const mockUser = {
  premium: false
};

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  
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

  const [preferences, setPreferences] = useState({
    language: 'Français',
    autoPlay: true
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ResponsiveLayout
        title="Paramètres"
        showNavigation={true}
        maxWidth="lg"
      >
        <div className="p-4 space-y-6">
        {/* Notifications */}
        <SettingSection title="Notifications">
          <SettingItem
            icon={<Bell className="h-4 w-4" />}
            title="Notifications push"
            description="Recevoir des notifications sur votre appareil"
          >
            <Switch 
              checked={notifications.push}
              onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
            />
          </SettingItem>

          <SettingItem
            icon={<Bell className="h-4 w-4" />}
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

          <SettingItem
            icon={<Bell className="h-4 w-4" />}
            title="Notifications email"
            description="Recevoir des emails de notification"
          >
            <Switch 
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
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
            icon={<Eye className="h-4 w-4" />}
            title="Afficher mon âge"
            description="Visible sur votre profil"
          >
            <Switch 
              checked={privacy.showAge}
              onCheckedChange={(checked) => setPrivacy({...privacy, showAge: checked})}
            />
          </SettingItem>

          <SettingItem
            icon={<Eye className="h-4 w-4" />}
            title="Afficher la distance"
            description="Montrer votre distance approximative"
          >
            <Switch 
              checked={privacy.showDistance}
              onCheckedChange={(checked) => setPrivacy({...privacy, showDistance: checked})}
            />
          </SettingItem>

          <SettingItem
            icon={<Eye className="h-4 w-4" />}
            title="Accusés de lecture"
            description="Montrer quand vous avez lu les messages"
          >
            <Switch 
              checked={privacy.readReceipts}
              onCheckedChange={(checked) => setPrivacy({...privacy, readReceipts: checked})}
            />
          </SettingItem>

          <SettingItem
            icon={<Shield className="h-4 w-4" />}
            title="Profils bloqués"
            description="Gérer les utilisateurs bloqués"
            onClick={() => console.log('Manage blocked profiles')}
          />

          <SettingItem
            icon={<Shield className="h-4 w-4" />}
            title="Signaler un problème"
            description="Signaler un bug ou un utilisateur"
            onClick={() => console.log('Report issue')}
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
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </SettingItem>

          <SettingItem
            icon={<Globe className="h-4 w-4" />}
            title="Langue"
            description={preferences.language}
            onClick={() => console.log('Change language')}
          />

          <SettingItem
            icon={<Volume2 className="h-4 w-4" />}
            title="Lecture automatique"
            description="Lire automatiquement les vidéos"
          >
            <Switch 
              checked={preferences.autoPlay}
              onCheckedChange={(checked) => setPreferences({...preferences, autoPlay: checked})}
            />
          </SettingItem>
        </SettingSection>

        {/* Premium */}
        <PremiumSection isPremium={mockUser.premium} />

        {/* Support & Legal */}
        <SettingSection title="Support & Légal">
          <SettingItem
            icon={<Shield className="h-4 w-4" />}
            title="Aide et support"
            description="Centre d'aide et contact"
            onClick={() => console.log('Open help')}
          />

          <SettingItem
            icon={<Shield className="h-4 w-4" />}
            title="Conditions d'utilisation"
            description="Lire nos conditions"
            onClick={() => console.log('Open terms')}
          />

          <SettingItem
            icon={<Shield className="h-4 w-4" />}
            title="Politique de confidentialité"
            description="Comment nous protégeons vos données"
            onClick={() => console.log('Open privacy policy')}
          />
        </SettingSection>

        {/* Account Actions */}
        <SettingSection title="Compte">
          <SettingItem
            icon={<Trash2 className="h-4 w-4" />}
            title="Supprimer le compte"
            description="Supprimer définitivement votre compte"
            onClick={() => console.log('Delete account')}
            className="text-destructive"
          />

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
          <p className="mt-1">© 2025 Matcha. Tous droits réservés.</p>
        </div>
        </div>
      </ResponsiveLayout>
    </div>
  );
}