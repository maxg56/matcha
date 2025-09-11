import { FiltersScreen } from '@/components/filters/FiltersScreen';
import { 
  DiscoverHeader,
  ProfileCard,
  NoMoreProfiles
} from '@/components/discover';
import { useMatches, useFilters } from '@/hooks';
import { useToast } from '@/hooks/ui/useToast';

export default function DiscoverPage() {
  const { currentProfile, actions, loading, error } = useMatches();
  const { showFilters, onOpenFilters, onCloseFilters, onFiltersChange } = useFilters();
  const { toast } = useToast();

  const handleMoreOptions = () => {
    console.log('More options');
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

  if (showFilters) {
    return (
      <FiltersScreen
        onClose={onCloseFilters}
        onApply={onFiltersChange}
      />
    );
  }

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
        {currentProfile ? (
          <ProfileCard
            profile={currentProfile}
            onLike={handleLike}
            onPass={handlePass}
            onSuperLike={() => {}} // Pas implémenté dans l'API
            onBoost={() => {}} // Pas implémenté dans l'API
            onMessage={() => {}} // À implémenter avec chat-service
            onReport={handleBlock} // Utilise block pour l'instant
          />
        ) : (
          <NoMoreProfiles onOpenFilters={onOpenFilters} />
        )}
      </div>
    </div>
  );
}
