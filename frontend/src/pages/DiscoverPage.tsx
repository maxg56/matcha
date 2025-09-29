import {
  DiscoverHeader,
  ProfileCard,
  NoMoreProfiles
} from '@/components/discover';
import { useMatches, useFilters } from '@/hooks';
import { useToast } from '@/hooks/ui/useToast';
import { MatchingPreferencesModal } from '@/components/preferences';
import { LocationPrompt } from '@/components/LocationPrompt';

export default function DiscoverPage() {
  const { currentProfile, currentCandidate, actions, loading, error, isProfileLoading } = useMatches();
  const { showFilters, onOpenFilters, onCloseFilters } = useFilters();
  const { toast } = useToast();

  const needsLocation = error === 'location_required';

  const handleAction = async (actionType: 'like' | 'pass' | 'block') => {
    if (!currentProfile) return;

    try {
      const response = await actions[actionType](currentProfile.id);

      if (actionType === 'like' && response.is_mutual) {
        toast({
          variant: 'success',
          message: "C'est un match ! 🎉 - Vous vous plaisez mutuellement !",
        });
      } else if (actionType === 'block') {
        toast({
          variant: 'success',
          message: "Utilisateur bloqué - Vous ne verrez plus ce profil",
        });
      }
    } catch (error) {
      const actionMessages = {
        like: "Impossible de liker ce profil",
        pass: "Impossible de passer ce profil",
        block: "Impossible de bloquer cet utilisateur"
      };

      let errorMessage = actionMessages[actionType];

      if (error instanceof Error && error.message.includes('duplicate')) {
        errorMessage = actionType === 'like' ? "Vous avez déjà liké ce profil" :
                      actionType === 'block' ? "Utilisateur déjà bloqué" :
                      "Vous avez déjà interagi avec ce profil";
      }

      toast({ variant: 'error', message: errorMessage });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <DiscoverHeader onOpenFilters={onOpenFilters} />
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
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <DiscoverHeader onOpenFilters={onOpenFilters} />
        <div className="flex-1 flex items-center justify-center">
          {needsLocation ? (
            <div className="flex flex-col items-center max-w-md">
              <LocationPrompt
                onDismiss={actions.refresh}
                onLocationSet={actions.refresh}
              />
              <div className="text-center p-8">
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
          ) : (
            <div className="text-center p-4">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={actions.refresh}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <DiscoverHeader onOpenFilters={onOpenFilters} />

      <div className="flex-1 p-4 overflow-hidden bg-gradient-to-br
                      from-purple-50 via-violet-50 to-indigo-50
                      dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {currentCandidate ? (
          currentProfile ? (
            <ProfileCard
              profile={currentProfile}
              candidate={currentCandidate}
              onLike={() => handleAction('like')}
              onPass={() => handleAction('pass')}
              onReport={() => handleAction('block')}
            />
          ) : isProfileLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Chargement du profil...</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 mb-4">Erreur lors du chargement du profil</p>
                <button
                  onClick={() => handleAction('pass')}
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

      <MatchingPreferencesModal
        isOpen={showFilters}
        onClose={onCloseFilters}
      />
    </div>
  );
}
