import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Users, Zap, Shield, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import PricingCard from '@/components/pricing/PricingCard';
import { PRICING_PLANS, PRICING_FAQ, type PricingPlan } from '@/types/pricing';
import { usePremiumStoreLegacy } from '@/stores/premiumStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/ui/useToast';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const {
    isPremium,
    subscription,
    isLoading,
    error,
    upgradeSubscription,
    checkSubscription,
    clearError
  } = usePremiumStoreLegacy();

  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    checkSubscription();
    // Auto-select most popular plan
    const popularPlan = PRICING_PLANS.find(plan => plan.isPopular);
    if (popularPlan) {
      setSelectedPlan(popularPlan);
    }

    // Handle payment success
    if (searchParams.get('success') === 'true') {
      toast({
        title: "🎉 Abonnement activé !",
        description: "Bienvenue dans Matcha Premium ! Profitez de toutes vos nouvelles fonctionnalités.",
      });

      // Clear URL params
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // Refresh subscription status
      checkSubscription();
    }
  }, [checkSubscription, searchParams, toast]);

  const handlePlanSelection = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    clearError();
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    clearError();

    try {
      await upgradeSubscription(selectedPlan.interval);
      toast({
        title: 'Redirection vers le paiement...',
        description: 'Vous allez être redirigé vers Stripe pour finaliser votre abonnement.'
      });
    } catch (error) {
      console.error('Subscription failed:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création de l\'abonnement',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentPlanId = (): string | null => {
    if (!subscription || !subscription.is_active) return null;

    // Map subscription interval to plan ID
    switch (subscription.plan) {
      case 'mensuel': return 'monthly';
      case 'trimestriel': return 'quarterly';
      case 'annuel': return 'yearly';
      default: return null;
    }
  };

  const currentPlanId = getCurrentPlanId();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>

            {isPremium && (
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Matcha Premium
            </h1>
          </div>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Débloquez votre potentiel de matching avec des fonctionnalités exclusives.
            <br />
            <span className="text-purple-600 font-semibold">7 jours d'essai gratuit</span> puis choisissez le plan qui vous convient.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">10x</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Plus de visibilité</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">3x</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Plus de matches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">De satisfaction</div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan?.id === plan.id}
              onSelect={handlePlanSelection}
              loading={isProcessing && selectedPlan?.id === plan.id}
              currentPlan={currentPlanId === plan.id}
              showTrialBadge={!isPremium}
            />
          ))}
        </div>

        {/* CTA Section */}
        {!isPremium && selectedPlan && (
          <div className="text-center mb-16">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">
                  Prêt à commencer avec {selectedPlan.name} ?
                </h3>
                <p className="mb-6 opacity-90">
                  Commencez votre essai gratuit de 7 jours dès maintenant.
                  Aucune carte requise pendant l'essai.
                </p>
                <Button
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg px-8 py-3"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      Traitement...
                    </div>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Commencer l'essai gratuit
                    </>
                  )}
                </Button>

                {error && (
                  <div className="mt-4 bg-red-100 text-red-800 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Comparison */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <Button
              variant="outline"
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center gap-2"
            >
              Comparaison détaillée des fonctionnalités
              {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          {showComparison && (
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-center">Gratuit vs Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-4 px-4">Fonctionnalité</th>
                        <th className="text-center py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Users className="w-4 h-4" />
                            Gratuit
                          </div>
                        </th>
                        <th className="text-center py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Crown className="w-4 h-4 text-purple-600" />
                            Premium
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Swipes par jour', free: '20', premium: 'Illimités' },
                        { name: 'Super Likes par jour', free: '1', premium: '5+' },
                        { name: 'Profile Boosts', free: '0', premium: 'Mensuels' },
                        { name: 'Annuler les swipes', free: '❌', premium: '✅' },
                        { name: 'Distance de recherche', free: '100km', premium: 'Illimitée' },
                        { name: 'Voir qui vous like', free: '❌', premium: '✅' },
                        { name: 'Accusés de réception', free: '❌', premium: '✅' },
                        { name: 'Support prioritaire', free: '❌', premium: '✅' },
                      ].map((feature, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-4 px-4 font-medium">{feature.name}</td>
                          <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">
                            {feature.free}
                          </td>
                          <td className="py-4 px-4 text-center text-purple-600 font-semibold">
                            {feature.premium}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Questions fréquentes
          </h2>

          <div className="space-y-4">
            {PRICING_FAQ.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="cursor-pointer" onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    {expandedFaq === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </CardHeader>
                {expandedFaq === index && (
                  <CardContent className="pt-0">
                    <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-8 text-gray-500 dark:text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Annulation facile</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>+10k utilisateurs Premium</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Les prix sont TTC pour les résidents européens. Vous pouvez annuler votre abonnement à tout moment
            depuis vos paramètres. Votre accès Premium reste actif jusqu'à la fin de votre période payée.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;