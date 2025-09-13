import { useState } from 'react';
import { SubscriptionCard, type SubscriptionPlan } from '../components/payment/SubscriptionCard';
import { useSubscription } from '../hooks/useSubscription';
import { paymentService } from '../services/paymentService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AlertTriangle, Crown, Heart, Zap } from 'lucide-react';

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'mensuel',
    name: 'Matcha Mensuel',
    description: 'Abonnement mensuel avec toutes les fonctionnalités premium',
    price: 999, // 9.99€ en centimes
    currency: 'EUR',
    interval: 'month',
    priceId: 'mensuel',
    features: [
      'Profil vérifié avec badge',
      'Likes illimités',
      'Messages illimités',
      'Voir qui vous a liké',
      'Filtres de recherche avancés',
      'Mode invisible',
      'Super Likes quotidiens'
    ]
  },
  {
    id: 'annuel',
    name: 'Matcha Annuel',
    description: 'Abonnement annuel avec 2 mois gratuits',
    price: 9999, // 99.99€ en centimes (économie de ~20%)
    currency: 'EUR',
    interval: 'year',
    priceId: 'annuel',
    popular: true,
    features: [
      'Toutes les fonctionnalités du plan mensuel',
      '2 mois gratuits (économie de 20%)',
      'Support prioritaire',
      'Accès anticipé aux nouvelles fonctionnalités',
      'Badge membre fidèle',
      'Statistiques détaillées du profil'
    ]
  }
];

export default function SubscriptionPage() {
  const { subscription, loading: subscriptionLoading, isActive } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlanSelect = async (priceId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedPlan(priceId);

      const result = await paymentService.createCheckoutSession({
        plan: priceId as 'mensuel' | 'annuel'
      });

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('URL de redirection manquante');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const getStatusBadge = () => {
    if (!subscription) return null;
    
    const statusConfig: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary'; icon: React.ReactNode }> = {
      active: { label: 'Actif', variant: 'default' as const, icon: <Crown className="w-3 h-3" /> },
      canceled: { label: 'Annulé', variant: 'destructive' as const, icon: <AlertTriangle className="w-3 h-3" /> },
      past_due: { label: 'Impayé', variant: 'destructive' as const, icon: <AlertTriangle className="w-3 h-3" /> },
      incomplete: { label: 'Incomplet', variant: 'secondary' as const, icon: <AlertTriangle className="w-3 h-3" /> },
      trialing: { label: 'Essai', variant: 'secondary' as const, icon: <Zap className="w-3 h-3" /> },
      none: { label: 'Aucun', variant: 'secondary' as const, icon: <AlertTriangle className="w-3 h-3" /> },
    };

    const config = statusConfig[subscription.status] || statusConfig.none;
    
    return (
      <Badge variant={config.variant} className="ml-2">
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-4">
          <Heart className="w-8 h-8 text-pink-500" />
          Abonnements Matcha
          {getStatusBadge()}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Débloquez tout le potentiel de Matcha avec nos plans d'abonnement conçus 
          pour maximiser vos chances de rencontrer l'âme sœur.
        </p>
      </div>

      {subscriptionLoading ? (
        <div className="text-center">Chargement...</div>
      ) : (
        <>
          {subscription && isActive && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Votre abonnement actuel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Plan {subscription.plan}</p>
                    {subscription.current_period_end && (
                      <p className="text-sm text-muted-foreground">
                        Renouvellement le {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Gérer l'abonnement
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <SubscriptionCard
                key={plan.id}
                plan={plan}
                currentPlan={subscription?.plan === plan.id ? plan.id : undefined}
                onSelect={handlePlanSelect}
                loading={loading && selectedPlan === plan.priceId}
              />
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>
              Tous les abonnements se renouvellent automatiquement. 
              Vous pouvez annuler à tout moment dans les paramètres de votre compte.
            </p>
            <p className="mt-2">
              Paiement sécurisé géré par Stripe. Vos informations bancaires ne sont jamais stockées sur nos serveurs.
            </p>
          </div>
        </>
      )}
    </div>
  );
}