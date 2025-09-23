import { 
  DiscoverHeader,
  ProfileCard,
  NoMoreProfiles
} from '@/components/discover';
import { useMatches, useFilters } from '@/hooks';
import { useToast } from '@/hooks/ui/useToast';
import { MatchingPreferencesModal } from '@/components/preferences';
import { LocationPrompt } from '@/components/LocationPrompt';
import { useState } from 'react';

export default function DiscoverPage() {
  const { currentProfile, currentCandidate, actions, loading, error, isProfileLoading } = useMatches();
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

  const handleMoreOptions = () => {
    // More options functionality to be implemented
  };

  const handleLike = async () => {
    if (!currentProfile) return;
    
    try {
      const response = await actions.like(currentProfile.id);
      if (response.is_mutual) {
        toast({
          variant: 'success',
          message: "C'est un match ! 🎉 - Vous vous plaisez mutuellement !",
        });
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
    
    try {
      await actions.pass(currentProfile.id);
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

  // Le modal sera affiché en overlay, pas besoin de condition ici

  if (loading) {
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
      <div className="flex-1 p-4 overflow-hidden bg-gradient-to-br 
                      from-purple-50 via-violet-50 to-indigo-50 
                      dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {currentCandidate ? (
          // Affichage conditionnel : profil ou loading
          currentProfile ? (
            <ProfileCard
              profile={currentProfile}
              candidate={currentCandidate}
              onLike={handleLike}
              onPass={handlePass}
              onSuperLike={() => {}} // Pas implémenté dans l'API
              onBoost={() => {}} // Pas implémenté dans l'API
              onMessage={() => {}} // À implémenter avec chat-service
              onReport={handleBlock} // Utilise block pour l'instant
            />
          ) : isProfileLoading ? (
            // Skeleton loader pour le profil en cours de chargement
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Chargement du profil...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Score de compatibilité : {currentCandidate.compatibility_score ? (currentCandidate.compatibility_score * 100).toFixed(0) + '%' : 'N/A'}
                </p>
              </div>
            </div>
          ) : (
            // Erreur de chargement du profil
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 mb-4">Erreur lors du chargement du profil</p>
                <button
                  onClick={handlePass}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Passer au suivant
                </button>
              </div>
            </div>
          )
        ) : (
          <NoMoreProfiles 
            onOpenFilters={onOpenFilters}
            onRefresh={actions.refresh}
          />
        )}
      </div>

      {/* Modal des préférences */}
      <MatchingPreferencesModal
        isOpen={showFilters}
        onClose={onCloseFilters}
      />
    </div>
  );
}
