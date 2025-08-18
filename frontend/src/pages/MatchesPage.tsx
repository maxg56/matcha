import { useState } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BlurredLikesGrid } from '@/components/cards/BlurredLikeCard';
import { Button } from '@/components/ui/button';
import { LikeProfileModal } from '@/components/demo/LikeProfileModal';

const mockLikes = [
  {
    id: '1',
    name: 'Emma',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop',
    timestamp: 'Il y a 2h',
  },
  {
    id: '2',
    name: 'Sophie',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
    timestamp: 'Il y a 5h',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop',
    timestamp: 'Hier',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
    timestamp: 'Il y a 2j',
  },
];

const mockProfilesToLike = [
  {
    id: 'like1',
    name: 'Marie',
    age: 26,
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop',
    ],
    bio: 'Passionnée de musique et de danse. J\'adore découvrir de nouveaux artistes et bouger sur des rythmes entraînants !',
    location: 'Paris',
    occupation: 'Musicienne',
    interests: ['Musique', 'Danse', 'Concerts', 'Voyage'],
    distance: 3,
  },
  {
    id: 'like2',
    name: 'Léa',
    age: 23,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
    ],
    bio: 'Artiste peintre en herbe, j\'aime capturer la beauté du monde à travers mes pinceaux et mes couleurs.',
    location: 'Lyon',
    occupation: 'Artiste',
    interests: ['Art', 'Peinture', 'Exposition', 'Nature'],
    distance: 15,
  },
];

export default function MatchesPage() {
  const navigate = useNavigate();
  const [isLikeModalOpen, setIsLikeModalOpen] = useState(false);

  const handleLikeClick = (likeId: string) => {
    console.log('Like clicked:', likeId);
    // TODO: Implement like reveal logic
  };

  const handleOpenLikeModal = () => {
    setIsLikeModalOpen(true);
  };

  const handleCloseLikeModal = () => {
    setIsLikeModalOpen(false);
  };

  const handleLikeProfile = (profileId: string) => {
    console.log('Liked profile:', profileId);
    // TODO: Implement like logic
  };

  const handlePassProfile = (profileId: string) => {
    console.log('Passed profile:', profileId);
    // TODO: Implement pass logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ResponsiveLayout title="Likes Reçus" showNavigation={true} maxWidth="lg">
      <div className="p-4">
        {/* Header avec bouton pour liker */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">Vos Likes</h2>
            <p className="text-sm text-muted-foreground">
              {mockLikes.length} personne{mockLikes.length > 1 ? 's' : ''} vous {mockLikes.length > 1 ? 'ont' : 'a'} liké{mockLikes.length > 1 ? 's' : ''}
            </p>
          </div>
          <Button
            onClick={handleOpenLikeModal}
            className="gap-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
          >
            <Plus className="h-4 w-4" />
            Liker des profils
          </Button>
        </div>

        {/* Grid des likes floutés */}
        <BlurredLikesGrid
          likes={mockLikes}
          onLikeClick={handleLikeClick}
        />
      </div>

      {/* Modal pour liker de nouveaux profils */}
      <LikeProfileModal
        profiles={mockProfilesToLike}
        isOpen={isLikeModalOpen}
        onClose={handleCloseLikeModal}
        onLike={handleLikeProfile}
        onPass={handlePassProfile}
      />
      </ResponsiveLayout>
    </div>
  );
}
