import { FiltersScreen } from '@/components/filters/FiltersScreen';
import { 
  DiscoverHeader,
  ProfileCard,
  NoMoreProfiles
} from '@/components/discover';
import { useDiscoverProfiles, useFilters } from '@/hooks';

const mockProfiles = [
  {
    id: '1',
    name: 'Emma',
    age: 25,
    images: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=600&fit=crop'
    ],
    bio: 'Passionnée de photographie et de voyages 📸✈️ J\'adore capturer des moments uniques et explorer de nouveaux horizons. Toujours à la recherche de la prochaine aventure !',
    location: 'Paris',
    occupation: 'Photographe',
    interests: ['Photographie', 'Voyage', 'Art', 'Cuisine'],
    distance: 2,
  },
  {
    id: '2',
    name: 'Sophie',
    age: 28,
    images: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=400&h=600&fit=crop'
    ],
    bio: 'Designer UX/UI qui adore créer des expériences uniques et innovantes. Passionnée par l\'interaction entre technologie et créativité.',
    location: 'Lyon',
    occupation: 'UX Designer',
    interests: ['Design', 'Tech', 'Fitness', 'Lecture'],
    distance: 5,
  },
];

export default function DiscoverPage() {
  const { currentProfile, actions } = useDiscoverProfiles(mockProfiles);
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
      <div className="flex-1 p-4">
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