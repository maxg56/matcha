import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Crown, Zap, Eye, Star, Heart, TrendingUp, Sparkles } from 'lucide-react';
import PricingCard from '@/components/pricing/PricingCard';
import { PRICING_PLANS, type PricingPlan } from '@/types/pricing';
import { usePremiumStore } from '@/stores/premiumStore';

interface PremiumUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  trigger: 'swipe-limit' | 'like-received' | 'match-received' | 'profile-view' | 'super-like-used' | 'daily-reminder';
  contextData?: {
    profileName?: string;
    swipesLeft?: number;
    likesCount?: number;
  };
}

type UrgencyLevel = 'high' | 'medium' | 'low';

interface TriggerConfig {
  icon: React.ReactElement;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  urgency: UrgencyLevel;
  benefits: string[];
  cta: string;
  socialProof: string;
}

const triggerConfig: Record<string, TriggerConfig> = {
  'swipe-limit': {
    icon: <Zap className="w-16 h-16 text-orange-500" />,
    emoji: '😤',
    title: 'Plus de swipes !',
    subtitle: 'Tu as épuisé tes swipes gratuits pour aujourd\'hui',
    description: 'Ne rate plus jamais ton match parfait avec les swipes illimités',
    urgency: 'high',
    benefits: [
      'Swipes illimités tous les jours',
      'Plus d\'attente jusqu\'à demain',
      'Explore autant que tu veux'
    ],
    cta: 'Débloquer les swipes illimités',
    socialProof: 'Plus de 50 swipes par jour en moyenne avec Premium'
  },
  'like-received': {
    icon: <Heart className="w-16 h-16 text-pink-500" />,
    emoji: '😍',
    title: 'Quelqu\'un craque pour toi !',
    subtitle: 'Tu as reçu un nouveau like',
    description: 'Découvre qui te like et match instantanément',
    urgency: 'medium',
    benefits: [
      'Voir qui te like en temps réel',
      'Match instantané avec tes likes',
      '3x plus de matches en moyenne'
    ],
    cta: 'Voir qui me like',
    socialProof: 'Les utilisateurs Premium obtiennent 3x plus de matches'
  },
  'match-received': {
    icon: <Sparkles className="w-16 h-16 text-purple-500" />,
    emoji: '🎉',
    title: 'Nouveau match !',
    subtitle: 'Félicitations, c\'est un match parfait !',
    description: 'Maximise tes chances de nouveaux matches avec Premium',
    urgency: 'low',
    benefits: [
      'Voir qui te like avant de swiper',
      'Super Likes pour te démarquer',
      'Profile Boost pour être vu 10x plus'
    ],
    cta: 'Obtenir plus de matches',
    socialProof: '90% des matches Premium mènent à des conversations'
  },
  'profile-view': {
    icon: <Eye className="w-16 h-16 text-blue-500" />,
    emoji: '👀',
    title: 'Quelqu\'un visite ton profil !',
    subtitle: 'Ton profil attire l\'attention',
    description: 'Découvre qui consulte ton profil et optimise tes chances',
    urgency: 'medium',
    benefits: [
      'Voir tous tes visiteurs',
      'Statistiques détaillées',
      'Optimise ton profil efficacement'
    ],
    cta: 'Voir mes visiteurs',
    socialProof: 'Les utilisateurs Premium voient 5x plus de visiteurs'
  },
  'super-like-used': {
    icon: <Star className="w-16 h-16 text-yellow-500" />,
    emoji: '⭐',
    title: 'Super Like utilisé !',
    subtitle: 'Tu as montré ton intérêt fort',
    description: 'Obtiens plus de Super Likes pour te démarquer',
    urgency: 'medium',
    benefits: [
      '5 Super Likes par jour',
      '5x plus de chances de match',
      'Démarque-toi vraiment'
    ],
    cta: 'Obtenir plus de Super Likes',
    socialProof: 'Les Super Likes Premium ont 5x plus de succès'
  },
  'daily-reminder': {
    icon: <TrendingUp className="w-16 h-16 text-green-500" />,
    emoji: '🚀',
    title: 'Booste ton succès !',
    subtitle: 'Prêt à passer au niveau supérieur ?',
    description: 'Les utilisateurs Premium ont 10x plus de succès',
    urgency: 'low',
    benefits: [
      'Toutes les fonctionnalités Premium',
      'Résultats garantis',
      'Support prioritaire'
    ],
    cta: 'Découvrir Premium',
    socialProof: '95% des utilisateurs Premium recommandent'
  }
};

const PremiumUpsellModal: React.FC<PremiumUpsellModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  trigger,
  contextData
}) => {
  const [step, setStep] = useState<'main' | 'pricing'>('main');
  const config = triggerConfig[trigger];

  // Move all hooks to top level to avoid conditional hook calls
  const { upgradeSubscription } = usePremiumStore();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(PRICING_PLANS.find(p => p.isPopular) || PRICING_PLANS[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Animation d'entrée différée
  const [showContent, setShowContent] = useState(false);
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  // Move handleUpgrade to top level with useCallback to stabilize
  const handleUpgrade = useCallback(async () => {
    setIsProcessing(true);
    try {
      // selectedPlan.interval est déjà au bon format après refactoring
      await upgradeSubscription(selectedPlan.interval);
      onUpgrade();
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPlan.interval, upgradeSubscription, onUpgrade]);

  // Move getContextualMessage to useCallback
  const getContextualMessage = useCallback((): string => {
    if (trigger === 'like-received' && contextData?.profileName) {
      return `${contextData.profileName} et d'autres personnes craquent pour toi !`;
    }
    if (trigger === 'swipe-limit' && contextData?.swipesLeft !== undefined) {
      return `Il ne te reste que ${contextData.swipesLeft} swipes !`;
    }
    return config.subtitle;
  }, [trigger, contextData, config.subtitle]);

  if (!isOpen) return null;

  const urgencyStyles: Record<UrgencyLevel, string> = {
    high: 'from-red-600 via-orange-600 to-yellow-500',
    medium: 'from-purple-600 via-pink-600 to-red-500',
    low: 'from-purple-600 via-blue-600 to-indigo-600'
  };

  if (step === 'pricing') {

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <Card className="relative w-full max-w-6xl bg-white dark:bg-gray-900 p-0 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-6 text-white">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="text-center">
              <Crown className="w-12 h-12 mx-auto mb-3" />
              <h2 className="text-3xl font-bold mb-2">Choisissez votre plan Premium</h2>
              <p className="opacity-90">Commencez avec 7 jours gratuits, puis choisissez ce qui vous convient</p>
            </div>
          </div>

          <div className="p-6">
            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {PRICING_PLANS.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isSelected={selectedPlan.id === plan.id}
                  onSelect={setSelectedPlan}
                  loading={isProcessing && selectedPlan.id === plan.id}
                  showTrialBadge={true}
                />
              ))}
            </div>

            {/* Selected Plan CTA */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Plan sélectionné: {selectedPlan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {selectedPlan.description}
                </p>

                <div className="flex items-baseline justify-center gap-2 mb-4">
                  {selectedPlan.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {selectedPlan.originalPrice.toFixed(2)}€
                    </span>
                  )}
                  <span className="text-3xl font-bold text-purple-600">
                    {selectedPlan.price.toFixed(2)}€
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    /{selectedPlan.interval === 'mensuel' ? 'mois' : selectedPlan.interval === 'trimestriel' ? 'trimestre' : 'an'}
                  </span>
                </div>

                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-3 px-8 h-auto mb-4"
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Traitement...
                    </div>
                  ) : (
                    <>
                      🚀 Commencer l'essai gratuit de 7 jours
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Puis {selectedPlan.price.toFixed(2)}€{selectedPlan.interval === 'trimestriel' ? ' tous les 3 mois' : selectedPlan.interval === 'annuel' ? '/an' : '/mois'}. Résiliable à tout moment.
                </p>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => setStep('main')}
                disabled={isProcessing}
              >
                Retour
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <Card className={`relative w-full max-w-md bg-white dark:bg-gray-900 p-0 overflow-hidden transition-all duration-500 ${showContent ? 'animate-in zoom-in-95' : 'animate-out zoom-out-95'}`}>
        {/* Header avec gradient dynamique */}
        <div className={`bg-gradient-to-br ${urgencyStyles[config.urgency]} p-6 text-white relative overflow-hidden`}>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Particules d'animation pour high urgency */}
          {config.urgency === 'high' && (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-ping" />
              <div className="absolute top-20 right-16 w-1 h-1 bg-white rounded-full animate-ping delay-150" />
              <div className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-white rounded-full animate-ping delay-300" />
            </div>
          )}

          <div className="text-center relative z-10">
            <div className="mb-3 animate-bounce">
              {config.icon}
            </div>
            <div className="text-3xl mb-2">{config.emoji}</div>
            <h2 className="text-2xl font-bold mb-1">{config.title}</h2>
            <p className="opacity-90 text-sm">{getContextualMessage()}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
            {config.description}
          </p>

          {/* Benefits */}
          <div className="space-y-2 mb-6">
            {config.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-6">
            <p className="text-blue-700 dark:text-blue-300 text-sm text-center font-medium">
              💡 {config.socialProof}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              className={`w-full text-white text-lg py-3 h-auto bg-gradient-to-r ${urgencyStyles[config.urgency]} hover:shadow-lg transform hover:scale-[1.02] transition-all`}
              onClick={() => setStep('pricing')}
            >
              <Crown className="w-4 h-4 mr-2" />
              {config.cta}
            </Button>

            <Button
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={onClose}
            >
              Peut-être plus tard
            </Button>
          </div>

          {/* Urgency indicator */}
          {config.urgency === 'high' && (
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="font-medium">Offre limitée dans le temps</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PremiumUpsellModal;