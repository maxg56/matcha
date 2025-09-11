import { useState, useEffect } from 'react';
import { matchService, type Match, type MatchesResponse } from '@/services/matchService';
import { useToast } from '@/hooks/ui/useToast';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: MatchesResponse = await matchService.getMatches();
      setMatches(response.matches);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement des matches';
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
                onClick={fetchMatches}
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Vos Matches
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {matches.length} match{matches.length !== 1 ? 'es' : ''}
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun match pour le moment
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Continuez à découvrir de nouveaux profils pour trouver vos matches !
            </p>
            <button
              onClick={() => window.location.href = '/discover'}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Découvrir des profils
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onUnmatch={() => handleUnmatch()}
                onMessage={handleMessage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}