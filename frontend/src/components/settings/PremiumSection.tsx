import { Button } from '@/components/ui/button';
import { Crown, Zap, Star } from 'lucide-react';
import { SettingSection } from './SettingSection';
import { SettingItem } from './SettingItem';
import { useNavigate } from 'react-router-dom';

interface PremiumSectionProps {
  isPremium: boolean;
}

export function PremiumSection({ isPremium }: PremiumSectionProps) {
  const navigate = useNavigate();

  const handlePricingRedirect = () => {
    navigate('/app/pricing');
  };

  if (isPremium) return null;

  return (
    <SettingSection title="Premium">
      <div className="p-4 ">
        <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl p-4 text-white mb-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5" />
            <h3 className="font-semibold">Matcha Premium</h3>
          </div>
          <p className="text-sm opacity-90 mb-3">
            Débloquez toutes les fonctionnalités premium pour une expérience optimale
          </p>
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 shadow-lg transition-colors"
            onClick={handlePricingRedirect}
          >
            Découvrir Premium
          </Button>
        </div>
      </div>

      <SettingItem
        icon={<Zap className="h-4 w-4" />}
        title="Boost"
        description="Soyez vu par plus de personnes"
        onClick={handlePricingRedirect}
      />

      <SettingItem
        icon={<Star className="h-4 w-4" />}
        title="Super Likes"
        description="Montrez votre intérêt spécial"
        onClick={handlePricingRedirect}
      />
    </SettingSection>
  );
}
