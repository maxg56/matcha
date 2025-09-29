import { useState, useEffect } from 'react';
import { Heart, Clock, MapPin, Briefcase, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileModal } from '@/components/demo/ProfileModal';
import { matchService, type LikeReceived, type ReceivedLikesResponse } from '@/services/matchService';

interface LikesTabProps {
  onMatchCreated?: () => void;
}

export function LikesTab({ onMatchCreated }: LikesTabProps = {}) {
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likes, setLikes] = useState<LikeReceived[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Utiliser localStorage pour persister les likes traités
  const [processedLikeIds, setProcessedLikeIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('processedLikeIds');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Fonction pour mettre à jour les IDs traités et les sauvegarder
  const markAsProcessed = (userId: number) => {
    setProcessedLikeIds(prev => {
      const newSet = new Set(prev).add(userId);
      const arrayToSave = Array.from(newSet);
      localStorage.setItem('processedLikeIds', JSON.stringify(arrayToSave));
      return newSet;
    });
  };

  // Récupérer les likes reçus au chargement du composant
  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: ReceivedLikesResponse = await matchService.getReceivedLikes();
      
      // Filtrer les likes auxquels on a déjà répondu
      const filteredLikes = response.likes.filter(like => !processedLikeIds.has(like.user.id));
      setLikes(filteredLikes);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement des likes';
      setError(message);
      setLikes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (like: any) => {
    setSelectedProfile({
      id: like.user.id.toString(),
      name: like.user.first_name,
      age: like.user.age,
      images: like.user.images || [],
      bio: like.user.bio,
      location: like.user.current_city,
      occupation: like.user.job,
      interests: like.user.tags || []
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProfile(null);
  };

  const handleLike = async (profileId: string) => {
    try {
      const response = await matchService.likeUser(parseInt(profileId));
      
      if (response.is_mutual) {
        // Actualiser les matches si un match est créé
        if (onMatchCreated) {
          setTimeout(() => {
            onMatchCreated();
          }, 500); // Petit délai pour laisser le temps à l'API de se synchroniser
        }
      }
      
      // Marquer ce like comme traité et le retirer de la liste
      const userIdNumber = parseInt(profileId);
      markAsProcessed(userIdNumber);
      setLikes(currentLikes => currentLikes.filter(like => like.user.id.toString() !== profileId));
    } catch (error) {
      console.error('Erreur lors du like:', error);
    }
  };

  const handlePass = async (profileId: string) => {
    try {
      await matchService.passUser(parseInt(profileId));
      
      // Marquer ce like comme traité et le retirer de la liste
      const userIdNumber = parseInt(profileId);
      markAsProcessed(userIdNumber);
      setLikes(currentLikes => currentLikes.filter(like => like.user.id.toString() !== profileId));
    } catch (error) {
      console.error('Erreur lors du pass:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Likes reçus
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Les profils qui vous ont likés
          </p>
        </div>
        <Badge className="bg-pink-100 text-pink-600">
          {likes.length} likes
        </Badge>
      </div>

      {/* Gestion du loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des likes...</span>
        </div>
      )}

      {/* Gestion des erreurs */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Heart className="mx-auto h-12 w-12 mb-2" />
            <p className="font-semibold">Erreur de chargement</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={fetchLikes} variant="outline">
            Réessayer
          </Button>
        </div>
      )}

      {/* Affichage des likes ou état vide */}
      {!loading && !error && (
        <>
          {likes.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Aucun like pour le moment</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Les profils qui vous likeront apparaîtront ici !
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {likes.map((like) => (
          <div key={like.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border overflow-hidden hover:shadow-xl transition-shadow">
            <div className="flex items-center p-4 space-x-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                {like.user.first_name.charAt(0)}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {like.user.first_name}, {like.user.age}
                </h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(like.created_at)}</span>
                </div>
              </div>
              
              <div className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                <Heart className="h-4 w-4 fill-current" />
                Like
              </div>
            </div>

            <div className="px-4 pb-4 space-y-2">
              {like.user.current_city && (
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{like.user.current_city}</span>
                </div>
              )}
              
              {like.user.job && (
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <Briefcase className="h-4 w-4" />
                  <span>{like.user.job}</span>
                </div>
              )}

              <p className="text-gray-700 text-sm">{like.user.bio}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {like.user.tags?.slice(0, 3).map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleViewProfile(like)}
                >
                  Voir profil
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handlePass(like.user.id.toString())}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Passer
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                    onClick={() => handleLike(like.user.id.toString())}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Liker
                  </Button>
                </div>
              </div>
            </div>
          </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal du profil */}
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onLike={handleLike}
        />
      )}
    </div>
  );
}
