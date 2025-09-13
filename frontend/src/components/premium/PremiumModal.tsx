import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { X, Check, Crown, Eye, Zap, Users, Heart, Star } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: 'who-likes-me' | 'unlimited-swipes' | 'boost' | 'super-likes';
  onUpgrade: () => void;
}

const featureConfig = {
  'who-likes-me': {
    icon: <Eye className="w-12 h-12 text-purple-500" />,
    title: 'Voir qui te like',
    description: 'Découvre qui craque pour toi et match instantanément',
    benefit: '3x plus de matches en moyenne',
    cta: 'Voir mes likes'
  },
  'unlimited-swipes': {
    icon: <Zap className="w-12 h-12 text-orange-500" />,
    title: 'Swipes illimités',
    description: 'Ne rate plus jamais ton match parfait',
    benefit: 'Plus de 50 swipes par jour en moyenne',
    cta: 'Swiper sans limite'
  },
  'boost': {
    icon: <Crown className="w-12 h-12 text-yellow-500" />,
    title: 'Profile Boost',
    description: 'Sois vu 10x plus souvent pendant 30 minutes',
    benefit: '1000+ vues supplémentaires par boost',
    cta: 'Booster mon profil'
  },
  'super-likes': {
    icon: <Star className="w-12 h-12 text-blue-500" />,
    title: 'Super Likes',
    description: 'Montre ton intérêt fort et démarque-toi',
    benefit: '5x plus de chances de match',
    cta: 'Utiliser Super Like'
  }
};

const premiumFeatures = [
  { icon: <Eye className="w-5 h-5" />, text: 'Voir qui te like' },
  { icon: <Zap className="w-5 h-5" />, text: 'Swipes illimités' },
  { icon: <Crown className="w-5 h-5" />, text: 'Profile Boost mensuel' },
  { icon: <Star className="w-5 h-5" />, text: '5 Super Likes par jour' },
  { icon: <Users className="w-5 h-5" />, text: 'Voir qui visite ton profil' },
  { icon: <Heart className="w-5 h-5" />, text: 'Annuler les swipes (Rewind)' }
];

const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  feature = 'who-likes-me',
  onUpgrade
}) => {
  if (!isOpen) return null;

  const config = featureConfig[feature];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 p-0 overflow-hidden">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-6 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="text-center">
            {config.icon}
            <h2 className="text-2xl font-bold mt-2 mb-1">{config.title}</h2>
            <p className="opacity-90">{config.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Benefit highlight */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-6 text-center">
            <p className="text-purple-700 dark:text-purple-300 font-semibold">
              ⚡ {config.benefit}
            </p>
          </div>

          {/* Premium features */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Avec Matcha Premium :
            </h3>
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="flex items-center gap-2">
                  {feature.icon}
                  <span className="text-sm">{feature.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-3xl font-bold">9,99€</span>
                <span className="text-gray-600 dark:text-gray-400">/mois</span>
              </div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                🎉 7 jours gratuits
              </Badge>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-3 h-auto"
              onClick={onUpgrade}
            >
              🔥 {config.cta}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={onClose}
            >
              Peut-être plus tard
            </Button>
          </div>

          {/* Fine print */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Puis 9,99€/mois. Résilie à tout moment.
            <br />
            Aucune carte requise pendant l'essai gratuit.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PremiumModal;