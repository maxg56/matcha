import {
  DiscoverHeader,
  ProfileCard,
  NoMoreProfiles
} from '@/components/discover';
import { useMatches, useFilters, useDiscoverProfiles } from '@/hooks';
import { TestProfiles } from '@/components/discover/mockUsers';
import { useToast } from '@/hooks/ui/useToast';
import { LimitCounter, PremiumUpsellModal, ProfileBoost, RewindButton, DistanceSettings } from '@/components/premium';
import { usePremiumStoreLegacy } from '@/stores';
import { MatchingPreferencesModal } from '@/components/preferences';
import { LocationPrompt } from '@/components/LocationPrompt';
import { useState, useEffect } from 'react';

export default function DiscoverPage() {
  const { currentProfile, actions, isLoading, hasMoreProfiles, error } = useDiscoverProfiles(TestProfiles);
  const { showFilters, onOpenFilters, onCloseFilters, onFiltersChange } = useFilters();
  const { toast } = useToast();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Gérer l'affichage du prompt de géolocalisation
  const handleLocationSet = () => {
    // Rafraîchir les candidats après configuration de la géolocalisation
    actions.refresh();
  };

  // Vérifier si l'erreur nécessite la géolocalisation
  const needsLocation = error === 'location_required';

  // Premium store
  const {
    isPremium,
    checkSubscription,
    performRewind,
    updateLastSwipeAction,
    currentBoost
  } = usePremiumStoreLegacy();

  // Local state management
  const [swipesUsed, setSwipesUsed] = useState(15); // Simulate swipes used
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [upsellTrigger, setUpsellTrigger] = useState<'swipe-limit' | 'like-received' | 'match-received' | 'profile-view' | 'super-like-used' | 'daily-reminder'>('swipe-limit');

  // Initialize Premium store
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const DAILY_SWIPE_LIMIT = 20; // Non-premium limit
  const swipesRemaining = DAILY_SWIPE_LIMIT - swipesUsed;

  // Reset swipes at midnight (simplified)
  const getResetTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  const handleMoreOptions = () => {
    // More options functionality to be implemented
  };

  const handleLike = async () => {
    if (!currentProfile) return;

    // Check swipe limit for non-premium users
    if (!isPremium && swipesUsed >= DAILY_SWIPE_LIMIT) {
      setUpsellTrigger('swipe-limit');
      setShowUpsellModal(true);
      return;
    }

    try {
      const response = await actions.onLike(currentProfile.id);

      // Update swipe count and record action
      if (!isPremium) {
        setSwipesUsed(prev => prev + 1);
      }

      // Record swipe action for rewind feature
      updateLastSwipeAction({
        id: Date.now(),
        user_id: 0,
        target_user_id: currentProfile.id,
        action: 'like',
        timestamp: new Date().toISOString(),
        can_rewind: isPremium,
        rewind_expires_at: isPremium ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : null
      });

      if (response.is_mutual) {
        toast({
          variant: 'success',
          message: "C'est un match ! 🎉 - Vous vous plaisez mutuellement !",
        });

        // Show match upsell modal after a short delay
        setTimeout(() => {
          if (!isPremium && Math.random() > 0.7) { // 30% chance
            setUpsellTrigger('match-received');
            setShowUpsellModal(true);
          }
        }, 3000);
      } else {
        // Randomly show "like received" upsell for engagement
        if (!isPremium && Math.random() > 0.9) { // 10% chance
          setTimeout(() => {
            setUpsellTrigger('like-received');
            setShowUpsellModal(true);
          }, 1000);
        }
      }
    } catch (error) {
      let errorMessage = "Impossible de liker ce profil";

      if (error instanceof Error) {
        if (error.message.includes('duplicate key') ||
            error.message.includes('unique constraint') ||
            error.message.includes('duplicate_interaction') ||
            error.message.includes('SQLSTATE 23505')) {
          errorMessage = "Vous avez déjà liké ce profil";
        } else if (error.message.includes('failed to record interaction')) {
          errorMessage = "Erreur temporaire, veuillez réessayer";
        }
      }

      toast({
        variant: 'error',
        message: errorMessage,
      });
    }
  };

  const handlePass = async () => {
    if (!currentProfile) return;

    // Check swipe limit for non-premium users
    if (!isPremium && swipesUsed >= DAILY_SWIPE_LIMIT) {
      setUpsellTrigger('swipe-limit');
      setShowUpsellModal(true);
      return;
    }

    try {
      await actions.onPass(currentProfile.id);

      // Update swipe count and record action
      if (!isPremium) {
        setSwipesUsed(prev => prev + 1);
      }

      // Record swipe action for rewind feature
      updateLastSwipeAction({
        id: Date.now(),
        user_id: 0,
        target_user_id: currentProfile.id,
        action: 'pass',
        timestamp: new Date().toISOString(),
        can_rewind: isPremium,
        rewind_expires_at: isPremium ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : null
      });
    } catch (error) {
      let errorMessage = "Impossible de passer ce profil";

      if (error instanceof Error) {
        if (error.message.includes('duplicate key') ||
            error.message.includes('unique constraint') ||
            error.message.includes('duplicate_interaction') ||
            error.message.includes('SQLSTATE 23505')) {
          errorMessage = "Vous avez déjà interagi avec ce profil";
        } else if (error.message.includes('failed to record interaction')) {
          errorMessage = "Erreur temporaire, veuillez réessayer";
        }
      }

      toast({
        variant: 'error',
        message: errorMessage,
      });
    }
  };

  const handleBlock = async () => {
    if (!currentProfile) return;

    try {
      await actions.block(currentProfile.id);
      toast({
        variant: 'success',
        message: "Utilisateur bloqué - Vous ne verrez plus ce profil",
      });
    } catch (error) {
      let errorMessage = "Impossible de bloquer cet utilisateur";

      if (error instanceof Error) {
        if (error.message.includes('duplicate key') ||
            error.message.includes('unique constraint') ||
            error.message.includes('duplicate_interaction') ||
            error.message.includes('SQLSTATE 23505')) {
          errorMessage = "Utilisateur déjà bloqué";
        } else if (error.message.includes('failed to record interaction')) {
          errorMessage = "Erreur temporaire, veuillez réessayer";
        }
      }

      toast({
        variant: 'error',
        message: errorMessage,
      });
    }
  };

  const handleUpgrade = () => {
    // TODO: Integrate with actual payment system
    toast({
      variant: 'success',
      message: "Redirection vers le paiement Premium... 🚀",
    });
    setShowUpsellModal(false);
  };

  const handleSuperLike = async () => {
    if (!currentProfile) return;

    if (!isPremium) {
      setUpsellTrigger('super-like-used');
      setShowUpsellModal(true);
      return;
    }

    try {
      await actions.onSuperLike(currentProfile.id);

      // Record swipe action for rewind feature
      updateLastSwipeAction({
        id: Date.now(),
        user_id: 0,
        target_user_id: currentProfile.id,
        action: 'super_like',
        timestamp: new Date().toISOString(),
        can_rewind: isPremium,
        rewind_expires_at: isPremium ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : null
      });

      toast({
        variant: 'success',
        message: "Super Like envoyé ! ⭐",
      });
    } catch (error) {
      let errorMessage = "Impossible d'envoyer le Super Like";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: 'error',
        message: errorMessage,
      });
    }
  };

  const handleBoost = () => {
    if (!isPremium) {
      setUpsellTrigger('profile-view');
      setShowUpsellModal(true);
      return;
    }
    // Handle boost for premium users
    console.log('Boost profile!');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <DiscoverHeader
          onOpenFilters={onOpenFilters}
          onMoreOptions={handleMoreOptions}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Recherche de profils...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    if (needsLocation) {
      return (
        <div className="flex flex-col h-screen overflow-hidden">
          <DiscoverHeader
            onOpenFilters={onOpenFilters}
            onMoreOptions={handleMoreOptions}
          />
          <div className="flex-1 overflow-y-auto">
            <LocationPrompt
              onDismiss={() => setShowLocationPrompt(false)}
              onLocationSet={handleLocationSet}
            />
            <div className="flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Pour découvrir des profils près de chez vous, nous avons besoin de votre localisation.
                </p>
                <button
                  onClick={actions.refresh}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <DiscoverHeader
          onOpenFilters={onOpenFilters}
          onMoreOptions={handleMoreOptions}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={actions.refresh}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header fixe */}
      <DiscoverHeader
        onOpenFilters={onOpenFilters}
        onMoreOptions={handleMoreOptions}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden bg-gradient-to-br
                      from-purple-50 via-violet-50 to-indigo-50
                      dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

        {/* Premium Features Row */}
        <div className="mb-4 space-y-4">
          {/* Profile Boost */}
          {isPremium && (
            <div className="flex gap-4">
              <div className="flex-1">
                <ProfileBoost
                  onUpgrade={() => {
                    setUpsellTrigger('profile-view');
                    setShowUpsellModal(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* Distance Settings - Available for Premium users */}
          {isPremium && (
            <div className="flex gap-4">
              <div className="flex-1">
                <DistanceSettings
                  onUpgrade={() => {
                    setUpsellTrigger('daily-reminder');
                    setShowUpsellModal(true);
                  }}
                  onChange={(settings) => {
                    // Handle distance settings changes
                    console.log('Distance settings changed:', settings);
                  }}
                />
              </div>
            </div>
          )}

          {/* Swipe Counter and Controls */}
          <div className="flex gap-4 items-start">
            {/* Swipe Counter for non-premium users */}
            {!isPremium && (
              <div className="flex-1">
                <LimitCounter
                  current={swipesUsed}
                  limit={DAILY_SWIPE_LIMIT}
                  type="swipes"
                  onUpgrade={() => {
                    setUpsellTrigger('swipe-limit');
                    setShowUpsellModal(true);
                  }}
                  resetTime={getResetTime()}
                />
              </div>
            )}

            {/* Rewind Button */}
            <div className="flex items-center gap-2">
              <RewindButton
                onUpgrade={() => {
                  setUpsellTrigger('super-like-used');
                  setShowUpsellModal(true);
                }}
                size="md"
              />

              {/* Boost indicator when active */}
              {currentBoost && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg text-sm font-medium animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                  Boost Actif
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {currentProfile ? (
            <ProfileCard
              profile={currentProfile}
              onLike={handleLike}
              onPass={handlePass}
              onSuperLike={handleSuperLike}
              onBoost={handleBoost}
              onMessage={() => {}} // À implémenter avec chat-service
              onReport={handleBlock} // Utilise block pour l'instant
            />
          ) : hasMoreProfiles ? (
            // Skeleton loader pour le profil en cours de chargement
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Chargement du profil...</p>
              </div>
            </div>
          ) : (
            <NoMoreProfiles
              onOpenFilters={onOpenFilters}
              onRefresh={actions.refresh}
            />
          )}
        </div>
      </div>

      {/* Premium Upsell Modal */}
      <PremiumUpsellModal
        isOpen={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        onUpgrade={handleUpgrade}
        trigger={upsellTrigger}
        contextData={{
          profileName: currentProfile?.username,
          swipesLeft: swipesRemaining
        }}
      />

      {/* Modal des préférences */}
      <MatchingPreferencesModal
        isOpen={showFilters}
        onClose={onCloseFilters}
      />
    </div>
  );
}
