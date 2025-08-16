import { useState } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ImmersiveProfileCard } from '@/components/cards/ImmersiveProfileCard';
import { FiltersScreen } from '@/components/filters/FiltersScreen';
import { Button } from '@/components/ui/button';
import { Sliders, MoreHorizontal } from 'lucide-react';

const mockProfiles = [
  {
    id: '1',
    name: 'Emma',
    age: 25,
    images: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop',
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
  const [profiles] = useState(mockProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const handleLike = (id: string) => {
    console.log('Liked:', id);
    nextProfile();
  };

  const handlePass = (id: string) => {
    console.log('Passed:', id);
    nextProfile();
  };

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      console.log('No more profiles');
    }
  };

  const currentProfile = profiles[currentIndex];

  const handleFiltersChange = (filters: any) => {
    console.log('Filters applied:', filters);
    // TODO: Apply filters to profile search
  };

  if (showFilters) {
    return (
      <FiltersScreen
        onClose={() => setShowFilters(false)}
        onApply={handleFiltersChange}
      />
    );
  }

  return (
    <ResponsiveLayout
      showNavigation={true}
      maxWidth="full"
    >
      <div className="flex flex-col h-full">
        {/* Top section with app name and controls */}
        <div className="bg-background border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Matcha</h1>
                <p className="text-xs text-muted-foreground">Trouvez l'amour</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setShowFilters(true)}
              >
                <Sliders className="h-4 w-4" />
                Filtres
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main content - immersive profile */}
        <div className="flex-1">
          {currentProfile ? (
            <ImmersiveProfileCard
              profile={currentProfile}
              onLike={handleLike}
              onPass={handlePass}
              className="h-full max-w-md mx-auto md:max-w-lg lg:max-w-xl"
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-muted/30">
              <div className="text-center p-8">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sliders className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Plus de profils à découvrir
                </h3>
                <p className="text-muted-foreground mb-4">
                  Revenez plus tard pour voir de nouveaux profils
                </p>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setShowFilters(true)}
                >
                  <Sliders className="h-4 w-4" />
                  Ajuster les filtres
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}