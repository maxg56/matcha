import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { matchService, type LikeReceived, type ReceivedLikesResponse } from '@/services/matchService';
import { useToast } from '@/hooks/ui/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
import { LikeCard } from './LikeCard';
import { ProfileModal } from '@/components/demo/ProfileModal';

export function LikesTab() {
  const [likes, setLikes] = useState<LikeReceived[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLike, setSelectedLike] = useState<LikeReceived | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchLikes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: ReceivedLikesResponse = await matchService.getReceivedLikes();
      setLikes(response.likes);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement des likes';
      setError(message);
      toast({
        variant: 'error',
        message: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikes();
  }, []);

  const handleViewProfile = (like: LikeReceived) => {
    setSelectedLike(like);
    setIsModalOpen(true);
  };

  const handleLikeBack = async (userId: number) => {
    try {
      const response = await matchService.likeUser(userId);
      
      if (response.is_mutual) {
        toast({
          variant: 'success',
          message: "C'est un match ! 🎉",
        });
      } else {
        toast({
          variant: 'success',
          message: "Like envoyé !",
        });
      }
      
      // Retirer le like de la liste car il devient un match
      setLikes(currentLikes => currentLikes.filter(like => like.user.id !== userId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du like';
      toast({
        variant: 'error',
        message: message,
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLike(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner message="Chargement des likes reçus..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        error={error} 
        onRetry={fetchLikes}
        className="py-12"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Likes reçus
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Les profils qui vous ont likés
          </p>
        </div>
        
        {likes.length > 0 && (
          <Badge 
            variant="secondary" 
            className="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
          >
            {likes.length} like{likes.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Contenu */}
      {likes.length === 0 ? (
        <EmptyState
          icon={<Heart className="mx-auto h-12 w-12 text-gray-400" />}
          title="Aucun like reçu"
          description="Les profils qui vous likeront apparaîtront ici. Continuez à découvrir de nouveaux profils !"
          action={{
            label: "Découvrir des profils",
            onClick: () => window.location.href = '/app/discover'
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {likes.map((like) => (
            <LikeCard
              key={like.id}
              like={like}
              onViewProfile={handleViewProfile}
              onLikeBack={handleLikeBack}
            />
          ))}
        </div>
      )}

      {/* Modal du profil */}
      {selectedLike && (
        <ProfileModal
          profile={{
            id: selectedLike.user.id.toString(),
            name: selectedLike.user.first_name,
            age: selectedLike.user.age,
            images: selectedLike.user.images,
            bio: selectedLike.user.bio,
            location: selectedLike.user.current_city,
            occupation: selectedLike.user.job,
            interests: selectedLike.user.tags,
          }}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onLike={() => {
            handleLikeBack(selectedLike.user.id);
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}
