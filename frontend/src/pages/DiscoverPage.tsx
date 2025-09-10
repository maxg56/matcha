import { FiltersScreen } from '@/components/filters/FiltersScreen';
import { 
  DiscoverHeader,
  ProfileCard,
  NoMoreProfiles
} from '@/components/discover';
import { useDiscoverProfiles, useFilters } from '@/hooks';
import  { TestProfiles } from './../components/discover/mockUsers';

// 


export default function DiscoverPage() {
  const { currentProfile, actions } = useDiscoverProfiles(TestProfiles);
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
