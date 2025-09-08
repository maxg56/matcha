import { FiltersScreen } from '@/components/filters/FiltersScreen';
import { 
  DiscoverHeader,
  ProfileCard,
  NoMoreProfiles
} from '@/components/discover';
import { useDiscoverProfiles, useFilters } from '@/hooks';

export default function DiscoverPage() {
  const { currentProfile, actions } = useDiscoverProfiles();
  const { showFilters, onOpenFilters, onCloseFilters, onFiltersChange } = useFilters();

  const handleMoreOptions = () => {
    console.log('More options');
  };

  // Wrapper functions to convert string IDs to numbers
  const handleLike = (id: string) => actions.onLike(parseInt(id));
  const handlePass = (id: string) => actions.onPass(parseInt(id));
  const handleSuperLike = (id: string) => actions.onSuperLike?.(parseInt(id));
  const handleBoost = (id: string) => actions.onBoost?.(parseInt(id));
  const handleMessage = (id: string) => actions.onMessage?.(parseInt(id));
  const handleReport = (id: string) => actions.onReport?.(parseInt(id));

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
        {currentProfile ? (
          <ProfileCard
            profile={currentProfile}
            onLike={handleLike}
            onPass={handlePass}
            onSuperLike={handleSuperLike}
            onBoost={handleBoost}
            onMessage={handleMessage}
            onReport={handleReport}
          />
        ) : (
          <NoMoreProfiles onOpenFilters={onOpenFilters} />
        )}
      </div>
    </div>
  );
}