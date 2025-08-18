import { useState } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ImmersiveProfileCard } from '@/components/cards/ImmersiveProfileCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, Info } from 'lucide-react';

const demoProfiles = [
  {
    id: 'demo1',
    name: 'Luna',
    age: 24,
    images: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop'
    ],
    bio: '🎨 Artiste passionnée | 📚 Amoureuse des livres | ☕ Addict au café. Je peins mes émotions et découvre le monde à travers mes pinceaux. Toujours en quête de nouvelles inspirations et de belles rencontres !',
    location: 'Paris 11e',
    occupation: 'Illustratrice freelance',
    interests: ['Art', 'Peinture', 'Lecture', 'Café', 'Musique', 'Voyage', 'Photo'],
    distance: 2,
  },
  {
    id: 'demo2',
    name: 'Zoé',
    age: 27,
    images: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop'
    ],
    bio: '🏃‍♀️ Runner du dimanche | 🧘‍♀️ Yoga addict | 🌱 Végétarienne convaincue. UX Designer la semaine, exploratrice de trails le weekend. Je cherche quelqu\'un pour partager mes aventures !',
    location: 'Lyon',
    occupation: 'UX Designer',
    interests: ['Design', 'Course', 'Yoga', 'Voyage', 'Cuisine', 'Nature'],
    distance: 8,
  },
];

export default function CarouselDemo() {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleLike = (id: string) => {
    console.log('Liked profile:', id);
    nextProfile();
  };

  const handlePass = (id: string) => {
    console.log('Passed profile:', id);
    nextProfile();
  };

  const nextProfile = () => {
    setCurrentProfileIndex((prev) => 
      prev < demoProfiles.length - 1 ? prev + 1 : 0
    );
  };

  const resetDemo = () => {
    setCurrentProfileIndex(0);
    setShowInstructions(true);
  };

  const currentProfile = demoProfiles[currentProfileIndex];

  return (
    <ResponsiveLayout
      title="Démo Carrousel"
      showNavigation={true}
      maxWidth="lg"
    >
      <div className="flex flex-col h-full">
        {/* Instructions header */}
        {showInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 m-4 mb-0">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Comment utiliser le carrousel :</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• <strong>Flèches gauche/droite</strong> : Navigation entre les photos</li>
                  <li>• <strong>Barres en haut</strong> : Indicateurs de progression + clic direct</li>
                  <li>• <strong>Zone gauche/droite de l'image</strong> : Navigation tactile</li>
                  <li>• <strong>Bouton flèche</strong> : Révéler/cacher les détails du profil</li>
                  <li>• <strong>Image plein écran</strong> : Photo prend tout l'espace sans bordures</li>
                  <li>• <strong>Boutons en bas</strong> : Actions sous l'image pour plus de clarté</li>
                </ul>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowInstructions(false)}
                  className="mt-2 text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  Masquer les instructions
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-between items-center p-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Profil {currentProfileIndex + 1} / {demoProfiles.length}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentProfile.images.length} photo{currentProfile.images.length > 1 ? 's' : ''} disponible{currentProfile.images.length > 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex gap-2">
            {!showInstructions && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowInstructions(true)}
                className="gap-2"
              >
                <Info className="h-4 w-4" />
                Aide
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetDemo}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Profile card container - immersive */}
        <div className="flex-1">
          <ImmersiveProfileCard
            profile={currentProfile}
            onLike={handleLike}
            onPass={handlePass}
            className="h-full"
          />
        </div>

        {/* Demo info */}
        <div className="bg-muted/30 border-t border-border p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              💡 <strong>Astuce :</strong> Testez différentes méthodes de navigation dans les photos
            </p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span>👆 Clic sur les barres</span>
              <span>👈👉 Flèches</span>
              <span>📱 Zones tactiles</span>
              <span>🔼 Bouton détails</span>
              <span>⬇️ Boutons en bas</span>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}