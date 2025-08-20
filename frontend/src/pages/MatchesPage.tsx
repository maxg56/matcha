import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Plus } from 'lucide-react';
import { BlurredLikesGrid } from '@/components/cards/BlurredLikeCard';
import { Button } from '@/components/ui/button';

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


export default function MatchesPage() {
  const handleLikeClick = (likeId: string) => {
    console.log('Like clicked:', likeId);
    // TODO: Implement like reveal logic
  };
  
  const handleOpenLikeModal = () => {
    console.log('Open like modal - TODO: Implement');
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
      
      {/* TODO: Implement modal pour liker de nouveaux profils */}
      </ResponsiveLayout>
    </div>
  );
}