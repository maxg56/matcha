import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { MapPin, Globe, Crown, Users, Infinity } from 'lucide-react';
import { usePremiumStore } from '@/stores/premiumStore';

interface DistanceSettingsProps {
  onUpgrade?: () => void;
  onChange?: (settings: { maxDistance?: number; unlimitedEnabled?: boolean; globalEnabled?: boolean }) => void;
}

const DistanceSettings: React.FC<DistanceSettingsProps> = ({ onUpgrade, onChange }) => {
  const {
    isPremium,
    distanceSettings,
    isLoading,
    error,
    loadDistanceSettings,
    updateDistanceSettings,
    clearError
  } = usePremiumStore();

  const [localDistance, setLocalDistance] = useState(25);
  const [unlimitedEnabled, setUnlimitedEnabled] = useState(false);
  const [globalEnabled, setGlobalEnabled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadDistanceSettings();
  }, [loadDistanceSettings]);

  useEffect(() => {
    if (distanceSettings) {
      setLocalDistance(distanceSettings.current_distance);
      setUnlimitedEnabled(distanceSettings.unlimited_enabled);
      setGlobalEnabled(distanceSettings.global_search_enabled);
    }
  }, [distanceSettings]);

  const handleDistanceChange = (value: number[]) => {
    setLocalDistance(value[0]);
    setHasChanges(true);
    onChange?.({ maxDistance: value[0] });
  };

  const handleUnlimitedToggle = (enabled: boolean) => {
    if (enabled && !isPremium) {
      onUpgrade?.();
      return;
    }

    setUnlimitedEnabled(enabled);
    setHasChanges(true);
    onChange?.({ unlimitedEnabled: enabled });
  };

  const handleGlobalToggle = (enabled: boolean) => {
    if (enabled && !isPremium) {
      onUpgrade?.();
      return;
    }

    setGlobalEnabled(enabled);
    setHasChanges(true);
    onChange?.({ globalEnabled: enabled });
  };

  const handleSave = async () => {
    try {
      clearError();
      await updateDistanceSettings({
        max_distance: unlimitedEnabled ? undefined : localDistance,
        unlimited_enabled: unlimitedEnabled,
        global_search_enabled: globalEnabled
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update distance settings:', error);
    }
  };

  const getMatchesEstimate = (): { count: string; description: string } => {
    if (unlimitedEnabled || globalEnabled) {
      return {
        count: '10k+',
        description: 'Profils dans le monde entier'
      };
    }

    if (localDistance >= 100) {
      return {
        count: '1k+',
        description: 'Profils dans votre région'
      };
    }

    if (localDistance >= 50) {
      return {
        count: '500+',
        description: 'Profils dans votre ville'
      };
    }

    return {
      count: '100+',
      description: 'Profils à proximité'
    };
  };

  const estimate = getMatchesEstimate();

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          Distance de recherche
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Settings Display */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Portée actuelle
            </span>
            <div className="flex items-center gap-2">
              {unlimitedEnabled ? (
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  <Infinity className="w-3 h-3 mr-1" />
                  Illimitée
                </Badge>
              ) : (
                <Badge variant="outline">
                  {localDistance} km
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <Users className="w-4 h-4" />
            <span>{estimate.count} {estimate.description}</span>
          </div>
        </div>

        {/* Distance Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Distance maximale</label>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {unlimitedEnabled ? '∞' : `${localDistance} km`}
            </span>
          </div>

          <Slider
            value={[localDistance]}
            onValueChange={handleDistanceChange}
            max={distanceSettings?.max_distance_free || 100}
            min={5}
            step={5}
            disabled={unlimitedEnabled || isLoading}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>5 km</span>
            <span>{distanceSettings?.max_distance_free || 100} km max (gratuit)</span>
          </div>
        </div>

        {/* Premium Features */}
        <div className="space-y-4">
          {/* Unlimited Distance */}
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3">
              <Infinity className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium text-purple-900 dark:text-purple-100">
                  Distance illimitée
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Recherchez dans le monde entier
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isPremium && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
              <Switch
                checked={unlimitedEnabled}
                onCheckedChange={handleUnlimitedToggle}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Global Search */}
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Recherche globale
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Algorithme optimisé international
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isPremium && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
              <Switch
                checked={globalEnabled}
                onCheckedChange={handleGlobalToggle}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Premium Upgrade Prompt */}
        {!isPremium && (unlimitedEnabled || globalEnabled) && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-purple-900 dark:text-purple-100">
                Fonctionnalités Premium
              </span>
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-400 mb-3">
              Débloquez la recherche illimitée et trouvez plus de matches
            </p>
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Passer au Premium
            </Button>
          </div>
        )}

        {/* Current limits for free users */}
        {!isPremium && (
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Limite gratuite : {distanceSettings?.max_distance_free || 100} km
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Premium : distance illimitée + recherche mondiale
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (distanceSettings) {
                  setLocalDistance(distanceSettings.current_distance);
                  setUnlimitedEnabled(distanceSettings.unlimited_enabled);
                  setGlobalEnabled(distanceSettings.global_search_enabled);
                  setHasChanges(false);
                }
              }}
              variant="outline"
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sauvegarder
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">💡 Conseil</p>
          <p>
            Une distance plus large augmente vos chances de trouver des matches compatibles,
            mais peut réduire la proximité géographique.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DistanceSettings;