import { useState } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Sliders,
  Heart,
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  Camera,
  Info
} from 'lucide-react';

const mockProfiles = [
  {
    id: '1',
    name: 'Emma',
    age: 25,
    images: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop'
    ],
    bio: 'Passionnée de photographie et de voyages 📸✈️\n\nJ\'adore découvrir de nouveaux endroits et capturer des moments uniques. Toujours prête pour une nouvelle aventure !',
    location: 'Paris, 11ème',
    occupation: 'Photographe freelance',
    education: 'École de Photographie',
    interests: ['Photographie', 'Voyage', 'Art', 'Cuisine', 'Randonnée'],
    distance: 2,
  },
  {
    id: '2',
    name: 'Sophie',
    age: 28,
    images: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=400&h=600&fit=crop'
    ],
    bio: 'Designer UX/UI qui adore créer des expériences uniques ✨\n\nPassionnée par la tech et l\'innovation. Fan de yoga et de café de spécialité ☕',
    location: 'Lyon, 2ème',
    occupation: 'UX Designer chez Startup',
    education: 'Master Design Numérique',
    interests: ['Design', 'Tech', 'Yoga', 'Café', 'Lecture'],
    distance: 5,
  },
];

export default function DiscoverPageDesktop() {
  const [profiles] = useState(mockProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
      setSelectedImageIndex(0);
    }
  };

  const currentProfile = profiles[currentIndex];

  return (
    <ResponsiveLayout title="Découvrir" showNavigation={true} maxWidth="full">
      {currentProfile ? (
        <div className="flex h-full">
          {/* Left side - Profile images */}
          <div className="flex-1 p-6 flex items-center justify-center bg-muted/20">
            <div className="w-full max-w-lg">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={currentProfile.images[selectedImageIndex]}
                  alt={currentProfile.name}
                  className="w-full h-full object-cover"
                />

                {/* Image navigation */}
                {currentProfile.images.length > 1 && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {currentProfile.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === selectedImageIndex
                            ? 'bg-white shadow-lg'
                            : 'bg-white/50 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Quick info overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">
                    {currentProfile.name}, {currentProfile.age}
                  </h2>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>{currentProfile.location} • À {currentProfile.distance}km</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-center gap-6 mt-8">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handlePass(currentProfile.id)}
                  className="h-16 w-16 rounded-full bg-white border-gray-200 hover:bg-gray-50 text-red-500 hover:text-red-600 shadow-lg"
                >
                  <X className="h-8 w-8" />
                </Button>

                <Button
                  size="lg"
                  onClick={() => handleLike(currentProfile.id)}
                  className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
                >
                  <Heart className="h-8 w-8 fill-current" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - Profile details */}
          <div className="w-96 border-l border-border bg-card">
            <div className="h-full overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={currentProfile.images[0]} />
                      <AvatarFallback>{currentProfile.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {currentProfile.name}, {currentProfile.age}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        À {currentProfile.distance}km
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Info className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Profile Info */}
              <div className="p-6 space-y-6">
                {/* Bio */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">À propos</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {currentProfile.bio}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Informations</h4>

                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{currentProfile.location}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{currentProfile.occupation}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{currentProfile.education}</span>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Centres d'intérêt</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Photos grid */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Photos ({currentProfile.images.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {currentProfile.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          index === selectedImageIndex
                            ? 'border-primary shadow-lg'
                            : 'border-transparent hover:border-primary/50'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${currentProfile.name} photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Plus de profils à découvrir
            </h3>
            <p className="text-muted-foreground mb-6">
              Revenez plus tard pour voir de nouveaux profils, ou ajustez vos critères de recherche
            </p>
            <Button className="gap-2">
              <Sliders className="h-4 w-4" />
              Ajuster les filtres
            </Button>
          </div>
        </div>
      )}
    </ResponsiveLayout>
  );
}
