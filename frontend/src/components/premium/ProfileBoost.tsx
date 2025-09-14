import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, TrendingUp, Eye, Clock, Sparkles } from 'lucide-react';
import { usePremiumStore } from '@/stores/premiumStore';

interface ProfileBoostProps {
  onUpgrade?: () => void;
}

const ProfileBoost: React.FC<ProfileBoostProps> = ({ onUpgrade }) => {
  const {
    isPremium,
    currentBoost,
    boostAvailability,
    boostTimer,
    showBoostModal,
    isLoading,
    error,
    startBoost,
    checkBoostAvailability,
    setShowBoostModal,
    clearError
  } = usePremiumStore();

  const [selectedBoostType, setSelectedBoostType] = useState<'daily_boost' | 'super_boost' | 'premium_monthly'>('daily_boost');

  useEffect(() => {
    checkBoostAvailability();
  }, [checkBoostAvailability]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getBoostTypeConfig = () => {
    const configs = {
      daily_boost: {
        name: 'Boost Gratuit',
        duration: '30 min',
        multiplier: '3x',
        icon: <Zap className="w-5 h-5 text-orange-500" />,
        color: 'from-orange-400 to-red-500',
        description: 'Boost quotidien gratuit'
      },
      super_boost: {
        name: 'Super Boost',
        duration: '60 min',
        multiplier: '10x',
        icon: <Crown className="w-5 h-5 text-purple-500" />,
        color: 'from-purple-500 to-pink-500',
        description: 'Visibilité maximum'
      },
      premium_monthly: {
        name: 'Boost Premium',
        duration: '120 min',
        multiplier: '15x',
        icon: <Sparkles className="w-5 h-5 text-yellow-500" />,
        color: 'from-yellow-400 to-orange-500',
        description: 'Boost mensuel inclus'
      }
    };
    return configs[selectedBoostType];
  };

  const handleStartBoost = async () => {
    try {
      clearError();
      await startBoost(selectedBoostType);
      setShowBoostModal(false);
    } catch (error) {
      console.error('Failed to start boost:', error);
    }
  };

  // Active boost display
  if (currentBoost && boostTimer > 0) {
    const config = getBoostTypeConfig();
    const progress = (boostTimer / (currentBoost.expires_at ?
      (new Date(currentBoost.expires_at).getTime() - new Date(currentBoost.started_at).getTime()) / 1000
      : 1800)) * 100;

    return (
      <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {config.icon}
              <CardTitle className="text-lg">Boost Actif</CardTitle>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                LIVE
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">{formatTime(boostTimer)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">restant</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full bg-gradient-to-r ${config.color} transition-all duration-1000`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Boost Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <Eye className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                +{currentBoost.views_during_boost}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Vues</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                +{currentBoost.likes_during_boost}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Likes</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {config.multiplier}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Visibilité</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span>Votre profil est actuellement mis en avant !</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Boost selection display
  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-orange-500" />
              <CardTitle>Profile Boost</CardTitle>
            </div>
            {!isPremium && (
              <Badge variant="outline" className="border-orange-500 text-orange-600">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <Zap className="w-12 h-12 text-orange-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Boostez votre visibilité
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Soyez vu 10x plus souvent pendant 30 minutes
            </p>

            {boostAvailability?.can_boost ? (
              <Button
                onClick={() => setShowBoostModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                disabled={isLoading}
              >
                <Zap className="w-4 h-4 mr-2" />
                {boostAvailability.remaining_boosts > 0 ? 'Utiliser Boost' : 'Boost Premium'}
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  {boostAvailability?.reason || 'Boost en cooldown'}
                </p>
                {boostAvailability?.next_boost_available_at && (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      Disponible dans {Math.floor(boostAvailability.cooldown_remaining_seconds / 3600)}h
                    </span>
                  </div>
                )}
                {!isPremium && (
                  <Button
                    onClick={onUpgrade}
                    variant="outline"
                    size="sm"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Passer au Premium
                  </Button>
                )}
              </div>
            )}
          </div>

          {boostAvailability && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {boostAvailability.remaining_boosts > 0 ? (
                <span>
                  {boostAvailability.remaining_boosts} boost{boostAvailability.remaining_boosts > 1 ? 's' : ''} restant{boostAvailability.remaining_boosts > 1 ? 's' : ''}
                </span>
              ) : (
                <span>Plus de boosts gratuits</span>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boost Selection Modal */}
      {showBoostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Choisir votre Boost
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Boost Type Selection */}
              <div className="space-y-2">
                {(['daily_boost', 'super_boost', 'premium_monthly'] as const).map((type) => {
                  const config = {
                    daily_boost: { name: 'Boost Gratuit', duration: '30min', multiplier: '3x', available: true },
                    super_boost: { name: 'Super Boost', duration: '60min', multiplier: '10x', available: isPremium },
                    premium_monthly: { name: 'Boost Premium', duration: '120min', multiplier: '15x', available: isPremium }
                  }[type];

                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedBoostType(type)}
                      disabled={!config.available}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        selectedBoostType === type
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      } ${!config.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{config.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {config.duration} • {config.multiplier} visibilité
                          </p>
                        </div>
                        {!config.available && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowBoostModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleStartBoost}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Lancer Boost
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default ProfileBoost;