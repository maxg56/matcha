import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export const AdminLoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleInputChange = (field: 'login' | 'password', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (localError) setLocalError(null);
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.login.trim() || !formData.password.trim()) {
      setLocalError('Veuillez remplir tous les champs');
      return;
    }

    try {
      await login(formData.login, formData.password);

      // Vérifier si l'utilisateur est admin après connexion
      const { user } = useAuthStore.getState();
      if (user) {
        // Liste des utilisateurs admin autorisés
        const adminUsers = ['admin', 'administrator', 'root'];
        const isAdmin = adminUsers.includes(user.username?.toLowerCase() || '') || user.id === 1;

        if (isAdmin) {
          navigate('/admin');
        } else {
          setLocalError('Accès non autorisé. Cette section est réservée aux administrateurs.');
          // Déconnexion automatique si pas admin
          useAuthStore.getState().logout();
        }
      }
    } catch (err) {
      // L'erreur sera gérée par le store
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Panel Administration
          </CardTitle>
          <CardDescription>
            Accès réservé aux administrateurs système
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {displayError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="admin-login">Identifiant administrateur</Label>
              <Input
                id="admin-login"
                type="text"
                placeholder="admin ou votre email"
                value={formData.login}
                onChange={(e) => handleInputChange('login', e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Votre mot de passe"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isLoading}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !formData.login.trim() || !formData.password.trim()}
            >
              {isLoading ? 'Connexion en cours...' : 'Accéder au panel'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-sm text-gray-600 dark:text-gray-400"
            >
              Retour à la connexion utilisateur
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
