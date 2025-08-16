import { useState } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ImmersiveProfileCard } from '@/components/cards/ImmersiveProfileCard';
import { FiltersScreen } from '@/components/filters/FiltersScreen';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  X, 
  Sliders, 
  MapPin, 
  Briefcase,
  Star,
  Settings,
  MoreHorizontal,
  ChevronDown,
  Zap,
  MessageCircle,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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
  const [showDetails, setShowDetails] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      setCurrentIndex(0); // Reset pour la demo
    }
    setCurrentImageIndex(0); // Reset image index when changing profile
  };

  const nextImage = () => {
    if (currentProfile && currentImageIndex < currentProfile.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const currentProfile = profiles[currentIndex];

  const handleFiltersChange = (filters: any) => {
    console.log('Filters applied:', filters);
    setShowFilters(false);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ResponsiveLayout showNavigation={true}>
        <div className="flex flex-col h-full">
          {/* Header avec Matcha et filtres */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 m-4 mb-0 rounded-t-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="h-5 w-5 text-white fill-current" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Matcha</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Découvrez l'amour</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600"
                  onClick={() => setShowFilters(true)}
                >
                  <Sliders className="h-4 w-4" />
                  Filtres
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main content - profil */}
          <div className="flex-1 mx-4 mb-4">
            {currentProfile ? (
              <div className="relative rounded-b-2xl overflow-hidden h-full flex flex-col">
                {/* Carousel d'images */}
                <div className="relative h-96 flex-shrink-0">
                  <img
                    src={currentProfile.images[currentImageIndex]}
                    alt={currentProfile.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Navigation images */}
                  {currentProfile.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors"
                        disabled={currentImageIndex === 0}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors"
                        disabled={currentImageIndex === currentProfile.images.length - 1}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      
                      {/* Indicateurs d'images */}
                      <div className="absolute top-4 left-4 right-4 flex gap-1">
                        {currentProfile.images.map((_, index) => (
                          <div
                            key={index}
                            className={`flex-1 h-1 rounded-full ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Section infos et boutons - en dehors de l'image */}
                <div className="flex-1 bg-white dark:bg-gray-800 flex flex-col">
                  {/* Infos profil */}
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentProfile.name}, {currentProfile.age}</h2>
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <MapPin className="h-4 w-4" />
                        <span>{currentProfile.location} • {currentProfile.distance}km</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Briefcase className="h-4 w-4" />
                        <span>{currentProfile.occupation}</span>
                      </div>
                    </div>
                    
                    {/* Flèche pour voir plus */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600"
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      <ChevronDown className={`h-5 w-5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>

                  {/* Boutons d'actions */}
                  <div className="px-6 pb-6 mt-auto">
                    <div className="grid grid-cols-5 gap-3">
                      {/* Passer */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-14 w-14 rounded-full border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handlePass(currentProfile.id)}
                      >
                        <X className="h-6 w-6" />
                      </Button>

                      {/* Super Like */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-14 w-14 rounded-full border-2 border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={() => console.log('Super liked:', currentProfile.id)}
                      >
                        <Star className="h-6 w-6" />
                      </Button>

                      {/* Like */}
                      <Button
                        size="icon"
                        className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-xl"
                        onClick={() => handleLike(currentProfile.id)}
                      >
                        <Heart className="h-7 w-7" />
                      </Button>

                      {/* Boost */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-14 w-14 rounded-full border-2 border-yellow-200 dark:border-yellow-600 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                        onClick={() => console.log('Boosted:', currentProfile.id)}
                      >
                        <Zap className="h-6 w-6" />
                      </Button>

                      {/* Message */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-14 w-14 rounded-full border-2 border-green-200 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                        onClick={() => console.log('Message:', currentProfile.id)}
                      >
                        <MessageCircle className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Détails dépliables - overlay complet */}
                {showDetails && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end">
                    <div className="w-full bg-white dark:bg-gray-800 rounded-t-3xl p-6 max-h-[70%] overflow-y-auto">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">À propos</h3>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {currentProfile.bio}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Centres d'intérêt</h3>
                          <div className="flex flex-wrap gap-2">
                            {currentProfile.interests.map((interest) => (
                              <Badge
                                key={interest}
                                variant="secondary"
                                className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1"
                              >
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Bouton Signaler dans la bio */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => console.log('Report:', currentProfile.id)}
                          >
                            <Shield className="h-4 w-4" />
                            Signaler ce profil
                          </Button>
                        </div>

                        <div className="pt-2">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowDetails(false)}
                          >
                            Fermer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Plus de profils */
              <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-10 w-10 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Plus de profils à découvrir
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Revenez plus tard pour voir de nouveaux profils
                  </p>
                  
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-lg"
                    onClick={() => setShowFilters(true)}
                  >
                    <Sliders className="h-5 w-5 mr-2" />
                    Ajuster les filtres
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ResponsiveLayout>
    </div>
  );
}