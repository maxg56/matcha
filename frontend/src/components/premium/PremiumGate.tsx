import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Star, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePremiumStatus } from './PremiumIndicator';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string;
  className?: string;
}

export function PremiumGate({ children, feature = "cette fonctionnalité", className }: PremiumGateProps) {
  const { isPremium, isLoading } = usePremiumStatus();
  const navigate = useNavigate();

  // Afficher un spinner pendant le chargement
  if (isLoading) {
    return (
      <div className={`min-h-[200px] flex items-center justify-center ${className || ''}`}>
        <LoadingSpinner message="Vérification du statut premium..." />
      </div>
    );
  }

  // Si l'utilisateur est premium, afficher le contenu normalement
  if (isPremium) {
    return <>{children}</>;
  }

  // Si l'utilisateur n'est pas premium, afficher le mur premium
  return (
    <div className={className}>
      <Card className="p-8 text-center border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
        <div className="space-y-6">
          {/* Icône premium */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-full flex items-center justify-center">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Star className="h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Titre */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Fonctionnalité Premium
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Pour accéder à {feature}, vous devez avoir un abonnement Premium
            </p>
          </div>

          {/* Avantages premium */}
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Avec Premium, débloquez :
            </h4>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span>Voir tous vos matches et leurs profils détaillés</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span>Découvrir qui a liké votre profil</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span>Analytics avancées de vos vues de profil</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span>Historique complet de vos interactions</span>
              </div>
            </div>
          </div>

          {/* Bouton d'action */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/app/premium')}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-3 text-lg"
              size="lg"
            >
              <Crown className="h-5 w-5 mr-2" />
              Passer à Premium
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              À partir de 9,99€/mois • Résiliez quand vous voulez
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

