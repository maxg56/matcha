import { FiltersScreen } from '@/components/filters/FiltersScreen';
import { 
  DiscoverHeader,
  ProfileCard,
  NoMoreProfiles
} from '@/components/discover';
import { useDiscoverProfiles, useFilters } from '@/hooks';

export default function DiscoverPage() {
  const { currentProfile, isLoading, error, actions, refreshProfiles } = useDiscoverProfiles();
  const { showFilters, onOpenFilters, onCloseFilters, onFiltersChange } = useFilters();

  const handleMoreOptions = () => {
    console.log('More options');
  };

  if (showFilters) {
    return (
      <FiltersScreen
        onClose={onCloseFilters}
        onApply={onFiltersChange}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <DiscoverHeader
        onOpenFilters={onOpenFilters}
        onMoreOptions={handleMoreOptions}
      />
      {/* Main content - profil */}
      <div className="flex-1 p-4 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
        {isLoading && !currentProfile ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Recherche de profils...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center text-red-600">
              <p className="mb-4">Erreur lors du chargement: {error}</p>
              <button 
                onClick={refreshProfiles} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : currentProfile ? (
          <ProfileCard
            profile={currentProfile}
            onLike={actions.onLike}
            onPass={actions.onPass}
            onSuperLike={actions.onSuperLike}
            onBoost={actions.onBoost}
            onMessage={actions.onMessage}
            onReport={actions.onReport}
          />
        ) : (
          <NoMoreProfiles onOpenFilters={onOpenFilters} />
        )}
      </div>
    </div>
  );
}