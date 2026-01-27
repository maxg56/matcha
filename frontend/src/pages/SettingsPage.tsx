import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks';
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
  Star,
  MapPin
} from 'lucide-react';
import { SettingItem, SettingSection, PremiumSection } from '@/components/settings';
import { locationService } from '@/services/locationService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/authStore';
import {useNavigate } from 'react-router-dom';


const mockUser = {
  premium: false
};

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
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

  const [preferences, setPreferences] = useState({
    language: 'Français',
    autoPlay: true
  });

  const [locationStatus, setLocationStatus] = useState<{
    enabled: boolean;
    loading: boolean;
    error: string | null;
  }>({
    enabled: false,
    loading: false,
    error: null
  });

  const handleUpdateLocation = async () => {
    setLocationStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await locationService.updateLocationFromBrowser();
      setLocationStatus(prev => ({ ...prev, enabled: true, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la localisation';
      setLocationStatus(prev => ({ ...prev, loading: false, error: errorMessage }));
      console.error('Erreur lors de la mise à jour de la localisation:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      alert("Erreur : utilisateur non connecté.");
      return;
    }

    const confirmMessage = "Êtes-vous sûr de vouloir supprimer votre compte ?\n\nCette action est irréversible et supprimera :\n• Votre profil et toutes vos informations\n• Vos photos et médias\n• Vos conversations et matches\n• Tout votre historique d'activité\n\nTapez 'SUPPRIMER' pour confirmer :";
    
    const userInput = window.prompt(confirmMessage);
    
    if (userInput === 'SUPPRIMER') {
      try {
        await userService.deleteAccount(user.id);
        
        // Déconnecter l'utilisateur et rediriger
        await logout();
        navigate('/goodbye');
        
        alert("Votre compte a été supprimé avec succès.");
      } catch (error) {
        console.error('Erreur lors de la suppression du compte:', error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Erreur lors de la suppression du compte.";
        alert(errorMessage);
      }
    } else if (userInput !== null) {
      alert("Suppression annulée. Vous devez taper exactement 'SUPPRIMER' pour confirmer.");
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        alert("Erreur lors de la déconnexion.");
      }
    }
  };


  return (
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
            onClick={() => {}}
          />

          <SettingItem
            icon={<Shield className="h-4 w-4" />}
            title="Signaler un problème"
            description="Signaler un bug ou un utilisateur"
            onClick={() => {}}
          />
        </SettingSection>

        {/* Géolocalisation */}
        <SettingSection title="Géolocalisation">
          <SettingItem
            icon={<MapPin className="h-4 w-4" />}
            title="Activer la géolocalisation"
            description={locationStatus.enabled ? "Votre position est configurée" : "Nécessaire pour trouver des matches à proximité"}
          >
            <button
              onClick={handleUpdateLocation}
              disabled={locationStatus.loading}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                locationStatus.enabled 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {locationStatus.loading ? 'Localisation...' : locationStatus.enabled ? 'Mettre à jour' : 'Activer'}
            </button>
          </SettingItem>
          
          {locationStatus.error && (
            <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{locationStatus.error}</p>
              <p className="text-xs text-red-500 mt-1">
                Vérifiez que vous avez autorisé l'accès à votre localisation dans votre navigateur.
              </p>
            </div>
          )}
          
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-600">
              💡 <strong>Pourquoi activer la géolocalisation ?</strong>
            </p>
            <ul className="text-xs text-blue-500 mt-1 space-y-1">
              <li>• Trouvez des matches près de chez vous</li>
              <li>• Voyez les distances sur la carte</li>
              <li>• Améliorez vos recommandations</li>
            </ul>
          </div>
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
            onClick={() => {}}
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
            onClick={() => {}}
          />

          <SettingItem
            icon={<Shield className="h-4 w-4" />}
            title="Conditions d'utilisation"
            description="Lire nos conditions"
            onClick={() => {}}
          />

          <SettingItem
            icon={<Shield className="h-4 w-4" />}
            title="Politique de confidentialité"
            description="Comment nous protégeons vos données"
            onClick={() => {}}
          />
        </SettingSection>

        {/* Account Actions */}
        <SettingSection title="Compte">
          <SettingItem
            icon={<Trash2 className="h-4 w-4" />}
            title="Supprimer le compte"
            description="Supprimer définitivement votre compte"
            onClick={handleDeleteAccount}
            className="text-destructive"
          />

          <SettingItem
            icon={<LogOut className="h-4 w-4" />}
            title="Se déconnecter"
            description="Vous déconnecter de votre session"

            onClick={handleLogout}
            className="text-destructive"
          />
        </SettingSection>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground pt-4 pb-8">
          <p>Matcha v1.0.0</p>
          <p className="mt-1">© 2025 Matcha. Tous droits réservés.</p>
        </div>
    </div>
  );
}