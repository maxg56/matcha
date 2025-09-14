import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Eye, Zap } from 'lucide-react';

interface PremiumBlurProps {
  children: React.ReactNode;
  feature: 'who-likes-me' | 'unlimited-swipes' | 'profile-visits' | 'advanced-filters';
  isBlurred?: boolean;
  onUpgrade?: () => void;
  className?: string;
}

const featureMessages = {
  'who-likes-me': {
    icon: <Eye className="w-6 h-6" />,
    title: 'Voir qui te like',
    description: 'Découvre qui craque pour toi',
    cta: 'Voir mes likes'
  },
  'unlimited-swipes': {
    icon: <Zap className="w-6 h-6" />,
    title: 'Swipes illimités',
    description: 'Swipe autant que tu veux',
    cta: 'Débloquer'
  },
  'profile-visits': {
    icon: <Eye className="w-6 h-6" />,
    title: 'Visites de profil',
    description: 'Vois qui visite ton profil',
    cta: 'Voir les visites'
  },
  'advanced-filters': {
    icon: <Crown className="w-6 h-6" />,
    title: 'Filtres avancés',
    description: 'Trouve exactement ce que tu cherches',
    cta: 'Débloquer les filtres'
  }
};

const PremiumBlur: React.FC<PremiumBlurProps> = ({
  children,
  feature,
  isBlurred = true,
  onUpgrade,
  className = ''
}) => {
  const config = featureMessages[feature];

  if (!isBlurred) {
    return <>{children}</>;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Contenu flouté */}
      <div className="filter blur-md pointer-events-none select-none">
        {children}
      </div>

      {/* Overlay Premium */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center">
        <div className="text-center text-white p-4 max-w-xs">
          {/* Icône premium */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-400" />
            <Lock className="w-4 h-4" />
          </div>

          {/* Icône de la fonctionnalité */}
          <div className="flex justify-center mb-3 text-purple-400">
            {config.icon}
          </div>

          {/* Message */}
          <h3 className="font-semibold text-lg mb-1">{config.title}</h3>
          <p className="text-sm text-gray-300 mb-4">{config.description}</p>

          {/* Bouton CTA */}
          <Button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm px-4 py-2 h-auto border-0 shadow-lg"
          >
            <Crown className="w-4 h-4 mr-2" />
            {config.cta}
          </Button>

          {/* Badge Premium */}
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-300 text-xs px-2 py-1 rounded-full border border-yellow-400/30">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumBlur;