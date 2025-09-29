import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, Zap, Heart, Eye, Filter, Ghost, Undo2, HeadphonesIcon, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/premium/PricingCard';
import { PremiumBadge } from '@/components/premium/PremiumBadge';
import { subscriptionService } from '@/services/subscriptionService';
import { pricingPlans } from '@/data/pricingPlans';
import type { PlanType, UserSubscription } from '@/types/subscription';

interface FeatureHighlight {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const premiumFeatures: FeatureHighlight[] = [
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Likes illimités",
    description: "Aimez autant de profils que vous voulez sans limitation"
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Voir qui vous a aimé",
    description: "Découvrez qui s'intéresse à vous avant de faire votre choix"
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: "Super Likes",
    description: "Montrez votre intérêt spécial avec des super likes quotidiens"
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Boost de profil",
    description: "Augmentez votre visibilité et obtenez plus de matchs"
  },
  {
    icon: <Filter className="h-6 w-6" />,
    title: "Filtres avancés",
    description: "Filtrez par âge, distance, centres d'intérêt et plus encore"
  },
  {
    icon: <Ghost className="h-6 w-6" />,
    title: "Mode incognito",
    description: "Naviguez de manière anonyme, seuls vos likes seront visibles"
  },
  {
    icon: <Undo2 className="h-6 w-6" />,
    title: "Annuler les likes",
    description: "Repensez vos choix et annulez vos derniers likes"
  },
  {
    icon: <HeadphonesIcon className="h-6 w-6" />,
    title: "Support prioritaire",
    description: "Bénéficiez d'une assistance rapide et personnalisée"
  }
];

export default function PremiumPage() {
  const [searchParams] = useSearchParams();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // Vérifier les paramètres de retour de Stripe
  const paymentSuccess = searchParams.get('success') === 'true';
  const paymentCanceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    const loadCurrentSubscription = async () => {
      try {
        const subscription = await subscriptionService.getCurrentSubscription();
        setCurrentSubscription(subscription);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'abonnement:', error);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    loadCurrentSubscription();
  }, []);

  const handlePlanSelect = async (planId: string) => {
    if (planId === 'gratuit') {
      return; // Le plan gratuit est déjà actif par défaut
    }

    console.log('🎯 Plan sélectionné:', planId);
    setLoading(planId);
    try {
      console.log('📞 Appel createSubscription...');
      const session = await subscriptionService.createSubscription(planId as PlanType);
      console.log('✅ Session reçue:', session);

      if (session && session.id) {
        console.log('🚀 Redirection vers Stripe avec session ID:', session.id);
        await subscriptionService.redirectToCheckout(session.id);
      } else {
        console.error('❌ Session invalide:', session);
        throw new Error('Session invalide reçue du serveur');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'abonnement:', error);
      // TODO: Afficher une notification d'erreur
    } finally {
      setLoading(null);
    }
  };

  const currentPlanId = currentSubscription?.planType || 'gratuit';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Messages de retour de Stripe */}
        {paymentSuccess && (
          <div className="mb-8 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">Paiement réussi !</h3>
                <p className="text-green-700 dark:text-green-300">
                  Votre abonnement Premium a été activé avec succès. Profitez de toutes les fonctionnalités !
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentCanceled && (
          <div className="mb-8 p-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              <div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">Paiement annulé</h3>
                <p className="text-orange-700 dark:text-orange-300">
                  Aucun souci ! Vous pouvez reprendre votre abonnement à tout moment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <PremiumBadge size="lg" className="text-lg px-4 py-2" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Débloquez votre potentiel
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Accédez à toutes les fonctionnalités premium de Matcha pour maximiser vos chances de trouver l'amour
          </p>

          {/* Features Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-violet-500 text-white p-3 rounded-full w-fit mx-auto mb-3">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Choisissez votre plan
          </h2>

          {isLoadingSubscription ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  currentPlan={currentPlanId}
                  onSelect={handlePlanSelect}
                  loading={loading === plan.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Success Stories Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Pourquoi choisir Premium ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">3x</div>
              <p className="text-gray-600 dark:text-gray-300">Plus de matchs en moyenne</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">85%</div>
              <p className="text-gray-600 dark:text-gray-300">Des utilisateurs Premium trouvent un match en 30 jours</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">24h</div>
              <p className="text-gray-600 dark:text-gray-300">Support client rapide et personnalisé</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Questions fréquentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Puis-je annuler mon abonnement à tout moment ?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Oui, vous pouvez annuler votre abonnement à tout moment depuis vos paramètres.
                Vous continuerez à bénéficier des fonctionnalités premium jusqu'à la fin de votre période de facturation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Les paiements sont-ils sécurisés ?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Absolument. Nous utilisons Stripe, une plateforme de paiement leader mondial,
                pour traiter tous les paiements de manière sécurisée. Vos informations bancaires ne sont jamais stockées sur nos serveurs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Que se passe-t-il si je change d'avis ?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Nous offrons une garantie de satisfaction. Si vous n'êtes pas satisfait dans les 7 premiers jours,
                contactez notre support pour un remboursement complet.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Bottom */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Prêt à transformer votre expérience de rencontre ?
          </p>
          <Button
            onClick={() => handlePlanSelect('mensuel')}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-3 text-lg"
            disabled={loading === 'mensuel'}
          >
            {loading === 'mensuel' ? 'Chargement...' : 'Commencer Premium'}
          </Button>
        </div>
      </div>
    </div>
  );
}