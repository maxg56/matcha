import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { type PricingPlan } from '@/types/pricing';

interface PricingCardProps {
  plan: PricingPlan;
  isSelected?: boolean;
  onSelect: (plan: PricingPlan) => void;
  showTrialBadge?: boolean;
  loading?: boolean;
  currentPlan?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isSelected = false,
  onSelect,
  showTrialBadge = true,
  loading = false,
  currentPlan = false
}) => {
  const getIntervalText = (interval: string): string => {
    switch (interval) {
      case 'mensuel': return 'mois';
      case 'trimestriel': return 'mois';
      case 'annuel': return 'mois';
      default: return interval;
    }
  };

  const getBillingText = (interval: string): string => {
    switch (interval) {
      case 'mensuel': return 'Facturé mensuellement';
      case 'trimestriel': return 'Facturé tous les 3 mois';
      case 'annuel': return 'Facturé annuellement';
      default: return '';
    }
  };

  const getTotalPrice = (): number => {
    switch (plan.interval) {
      case 'trimestriel': return plan.price * 3;
      case 'annuel': return plan.price * 12;
      default: return plan.price;
    }
  };

  const getSavingsPerYear = (): number => {
    if (!plan.originalPrice) return 0;
    const monthlyTotal = plan.originalPrice * 12;
    const planTotal = plan.price * (plan.interval === 'annuel' ? 12 : plan.interval === 'trimestriel' ? 4 * 3 : 12);
    return monthlyTotal - planTotal;
  };

  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isSelected
          ? 'ring-2 ring-purple-500 shadow-lg transform scale-105'
          : plan.isPopular
            ? 'ring-1 ring-purple-300 shadow-md'
            : 'hover:ring-1 hover:ring-gray-300'
      } ${currentPlan ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
      onClick={() => onSelect(plan)}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 shadow-lg">
            <Star className="w-3 h-3 mr-1" />
            {plan.badge}
          </Badge>
        </div>
      )}

      {/* Current Plan Badge */}
      {currentPlan && (
        <div className="absolute -top-3 right-4 z-10">
          <Badge className="bg-green-600 text-white px-3 py-1 shadow-lg">
            Plan actuel
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {plan.name}
          </h3>

          {plan.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {plan.description}
            </p>
          )}

          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-center gap-1">
              {plan.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {plan.originalPrice.toFixed(2)}€
                </span>
              )}
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {plan.price.toFixed(2)}€
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                /{getIntervalText(plan.interval)}
              </span>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getBillingText(plan.interval)}
            </p>

            {/* Savings */}
            {plan.savings && (
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                  {plan.savings}
                </Badge>
                {getSavingsPerYear() > 0 && (
                  <span className="text-xs text-green-600">
                    -{getSavingsPerYear().toFixed(0)}€/an
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Free Trial */}
          {showTrialBadge && plan.interval === 'mensuel' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 border border-blue-200 dark:border-blue-700">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                🎉 7 jours gratuits
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Annulation gratuite pendant l'essai
              </p>
            </div>
          )}

          {/* Total cost for longer plans */}
          {plan.interval !== 'mensuel' && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 border border-purple-200 dark:border-purple-700">
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Total: {getTotalPrice().toFixed(2)}€
                {plan.interval === 'trimestriel' ? ' tous les 3 mois' : ' par an'}
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Features */}
        <div className="space-y-3">
          {plan.features.slice(0, 6).map((feature) => (
            <div key={feature.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {feature.included ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 border border-gray-300 rounded-sm" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {feature.icon && (
                    <span className="text-sm">{feature.icon}</span>
                  )}
                  <span className={`text-sm font-medium ${
                    feature.included ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                  }`}>
                    {feature.name}
                  </span>
                  {feature.premium && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
                {feature.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {feature.description}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Show more features indicator */}
          {plan.features.length > 6 && (
            <div className="text-center pt-2">
              <span className="text-xs text-purple-600 dark:text-purple-400">
                +{plan.features.length - 6} autres fonctionnalités
              </span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          {currentPlan ? (
            <Button
              disabled
              className="w-full bg-green-600 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Plan actuel
            </Button>
          ) : (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(plan);
              }}
              disabled={loading}
              className={`w-full h-12 text-base font-semibold transition-all ${
                plan.isPopular
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                  : isSelected
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-white dark:bg-gray-800 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Chargement...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {plan.isPopular && <Zap className="w-4 h-4" />}
                  <span>
                    {showTrialBadge && plan.interval === 'mensuel'
                      ? 'Commencer l\'essai gratuit'
                      : 'Choisir ce plan'
                    }
                  </span>
                </div>
              )}
            </Button>
          )}
        </div>

        {/* Fine print */}
        {showTrialBadge && plan.interval === 'mensuel' && !currentPlan && (
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
            Puis {plan.price}€/mois. Résiliable à tout moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PricingCard;