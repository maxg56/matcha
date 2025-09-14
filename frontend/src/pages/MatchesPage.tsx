import { useState, useEffect } from 'react';
import { matchService, type Match, type ReceivedLikePreview, type LikeStats } from '@/services/matchService';
import { mockDataService } from '@/services/mockDataService';
import { useToast } from '@/hooks/ui/useToast';
import { BlurredLikesGrid } from '@/components/cards/BlurredLikeCard';
import PremiumModal from '@/components/premium/PremiumModal';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, TrendingUp, Heart, Crown } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onUnmatch?: (matchId: number) => void;
  onMessage?: (userId: number) => void;
}

function MatchCard({ match, onUnmatch, onMessage }: MatchCardProps) {
  const user = match.target_user || match.user;
  
  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center space-x-4">
        {user.profile_photos && user.profile_photos.length > 0 ? (
          <img
            src={user.profile_photos[0]}
            alt={`${user.first_name} ${user.last_name}`}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <span className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
              {(user.first_name && user.first_name.length > 0 ? user.first_name : 'U').charAt(0)}{(user.last_name && user.last_name.length > 0 ? user.last_name : 'U').charAt(0)}
            </span>
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user.age} ans
          </p>
          {user.bio && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>

        <div className="flex space-x-2">
          {onMessage && (
            <button
              onClick={() => onMessage(user.id)}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              Message
            </button>
          )}
          {onUnmatch && (
            <button
              onClick={() => onUnmatch(match.id)}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Unmatch
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [receivedLikes, setReceivedLikes] = useState<ReceivedLikePreview[]>([]);
  const [likeStats, setLikeStats] = useState<LikeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'matches' | 'likes'>('likes');
  const { toast } = useToast();

  // Simuler le statut premium (à remplacer par vraie logique)
  const [isPremium] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les matches
      let matchesData: Match[] = [];
      try {
        const matchesResponse = await matchService.getMatches();
        matchesData = matchesResponse.matches;
      } catch (error) {
        console.log('Matches API not available, using empty array');
      }

      // Charger les likes reçus (avec fallback sur données simulées)
      let likesPreviewData: ReceivedLikePreview[] = [];
      try {
        likesPreviewData = await matchService.getReceivedLikesPreview(3);
      } catch (error) {
        console.log('Received likes API not available, using mock data');
        // Utiliser les données simulées
        const mockLikes = mockDataService.generateMockReceivedLikes(5);
        likesPreviewData = mockLikes;
      }

      // Charger les statistiques (avec fallback)
      let statsData: LikeStats | null = null;
      try {
        statsData = await matchService.getLikeStats();
      } catch (error) {
        console.log('Like stats API not available, using mock data');
        // Utiliser les statistiques simulées
        statsData = mockDataService.generateMockLikeStats();
      }

      setMatches(matchesData);
      setReceivedLikes(likesPreviewData);
      setLikeStats(statsData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement des données';
      setError(message);
      toast({
        variant: 'error',
        message: message,
      });
    } finally {
      setLoading(false);
    }
  };


  const handleUnmatch = async () => {
    // Pour l'instant, on ne peut pas "unmatch" via l'API
    // Cette fonctionnalité pourrait être ajoutée plus tard
    toast({
      variant: 'info',
      message: "Fonctionnalité non disponible - L'unmatch n'est pas encore implémenté",
    });
  };

  const handleMessage = (userId: number) => {
    // Redirection vers la page de chat (à implémenter)
    console.log('Redirection vers chat avec utilisateur:', userId);
    toast({
      variant: 'info',
      message: "Fonctionnalité à venir - La messagerie sera bientôt disponible",
    });
  };

  const handleLikeClick = (likeId: string) => {
    if (!isPremium) {
      setShowPremiumModal(true);
    } else {
      // Logique pour voir le profil complet
      console.log('Voir le profil du like:', likeId);
    }
  };

  const handleUpgrade = () => {
    // Redirection vers la page de paiement
    window.location.href = '/app/subscription';
  };

  // Convertir les données pour BlurredLikesGrid
  const blurredLikesData = (receivedLikes || []).map(like => ({
    id: like.id,
    name: isPremium ? undefined : undefined, // Masquer le nom pour les gratuits
    image: like.blurred_image,
    timestamp: like.timestamp_relative
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Chargement de vos matches...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Vos Connexions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez qui s'intéresse à vous et vos matches actuels
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'likes'
                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Qui me like</span>
              {(receivedLikes || []).length > 0 && (
                <Badge className="bg-red-500 text-white text-xs">
                  {(receivedLikes || []).length}+
                </Badge>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'matches'
                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Mes matches</span>
              {(matches || []).length > 0 && (
                <Badge className="bg-green-500 text-white text-xs">
                  {(matches || []).length}
                </Badge>
              )}
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'likes' ? (
          <div className="space-y-6">
            {/* Stats Card */}
            {likeStats && (
              <Card className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Vos statistiques
                  </h3>
                  {!isPremium && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {isPremium ? likeStats.total_likes_received : '?'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">
                      {isPremium ? likeStats.likes_today : '?'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Aujourd'hui</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {isPremium ? likeStats.likes_this_week : '?'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Cette semaine</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {isPremium ? Math.round(likeStats.average_likes_per_day) : '?'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Par jour</div>
                  </div>
                </div>
                {!isPremium && (
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() => setShowPremiumModal(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      Débloquer les statistiques
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Likes Grid */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Qui vous a liké
                </h3>
                {(receivedLikes || []).length > 0 && !isPremium && (
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                    {(receivedLikes || []).length}+ nouveaux likes
                  </Badge>
                )}
              </div>

              {(receivedLikes || []).length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Eye className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Aucun like pour le moment
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-4">
                    Continuez à explorer et à interagir avec d'autres profils. Vos likes apparaîtront ici !
                  </p>
                  <Button
                    onClick={() => window.location.href = '/app/discover'}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Découvrir des profils
                  </Button>
                </div>
              ) : (
                <>
                  <BlurredLikesGrid
                    likes={blurredLikesData}
                    onLikeClick={handleLikeClick}
                    className="mb-4"
                  />
                  {!isPremium && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {(receivedLikes || []).length > 3 && `+${(receivedLikes || []).length - 3} autres personnes vous ont liké`}
                      </p>
                      <Button
                        onClick={() => setShowPremiumModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Voir tous mes likes
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        ) : (
          /* Matches Tab */
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Vos matches ({(matches || []).length})
            </h3>
            {(matches || []).length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Heart className="mx-auto h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucun match pour le moment
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Continuez à découvrir de nouveaux profils pour trouver vos matches !
                </p>
                <Button
                  onClick={() => window.location.href = '/app/discover'}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Découvrir des profils
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {(matches || []).map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onUnmatch={() => handleUnmatch()}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="who-likes-me"
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}