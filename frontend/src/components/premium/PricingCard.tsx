import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FeaturesList } from './FeaturesList';
import { PremiumBadge } from './PremiumBadge';
import type { PricingPlan } from '../../types/subscription';

interface PricingCardProps {
  plan: PricingPlan;
  currentPlan?: string;
  onSelect: (planId: string) => void;
  loading?: boolean;
}

export function PricingCard({ plan, currentPlan, onSelect, loading = false }: PricingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isCurrentPlan = currentPlan === plan.id;
  const isFree = plan.price === 0;

  const features = plan.features.map(feature => ({
    text: feature,
    included: true,
    highlight: false
  }));

  // Ajouter les limitations comme features non incluses pour le plan gratuit
  if (plan.limitations) {
    const limitations = plan.limitations.map(limitation => ({
      text: limitation,
      included: false,
      highlight: false
    }));
    features.push(...limitations);
  }

  return (
    <Card
      className={`relative transition-all duration-300 ${
        plan.popular
          ? 'border-purple-500 dark:border-purple-400 shadow-lg scale-105'
          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
      } ${isHovered && !plan.popular ? 'shadow-md' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
            Le plus populaire
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex justify-center items-center gap-2 mb-2">
          <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
          {!isFree && <PremiumBadge size="sm" showText={false} />}
        </div>

        <div className="flex justify-center items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
          </span>
          {plan.price > 0 && (
            <>
              <span className="text-gray-500 dark:text-gray-400">/{plan.period}</span>
              {plan.originalPrice && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  {plan.originalPrice}€
                </span>
              )}
            </>
          )}
        </div>

        {plan.originalPrice && plan.price < plan.originalPrice && (
          <div className="mt-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Économisez {plan.originalPrice - plan.price}€
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <FeaturesList features={features} className="mb-6" />

        <Button
          onClick={() => onSelect(plan.id)}
          disabled={isCurrentPlan || loading}
          className={`w-full ${
            plan.popular
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white'
          } ${isCurrentPlan ? 'opacity-50' : ''}`}
          variant={plan.popular ? 'default' : 'secondary'}
        >
          {loading ? (
            'Chargement...'
          ) : isCurrentPlan ? (
            'Plan actuel'
          ) : isFree ? (
            'Continuer gratuitement'
          ) : (
            `Choisir ${plan.name}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}