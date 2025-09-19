import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchService, type Match, type MatchesResponse } from '@/services/matchService';
import { useToast } from '@/hooks/ui/useToast';
import { ProfileViewers } from '@/components/profile/ProfileViewers';
import { ViewedProfilesList } from '@/components/profile/ViewedProfilesList';
import { MatchCard } from '@/components/matches/MatchCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { TabNavigation , type Tab} from '@/components/ui/TabNavigation';


type TabType = 'matches' | 'viewers' | 'viewed';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('matches');
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchMatches = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleUnmatch = async (matchId: number, targetUserId: number) => {
    try {
      await matchService.unmatchUser(targetUserId);

      // Retirer le match de la liste locale
      setMatches(currentMatches => currentMatches.filter(match => match.id !== matchId));

      toast({
        variant: 'success',
        message: "Match supprimé avec succès",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du unmatch';
      toast({
        variant: 'error',
        message: message,
      });
    }
  };

  const handleMessage = (userId: number) => {
    // Trouver le match correspondant pour obtenir l'ID du match
    const currentMatch = matches.find(match => {
      const user = match.target_user || match.user;
      return user && user.id === userId;
    });

    if (currentMatch) {
      // Rediriger vers la page de chat avec l'ID du match
      navigate(`/app/chat/${currentMatch.id}`);
    } else {
      toast({
        variant: 'error',
        message: "Impossible de trouver la conversation correspondante",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner message="Chargement de vos matches..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage error={error} onRetry={fetchMatches} />
        </div>
      </div>
    );
  }

  const tabs : Tab[] = [
    { id: 'matches', label: 'Mes Matches', count: matches?.length || 0 },
    { id: 'viewers', label: 'Qui a vu mon profil', count: null },
    { id: 'viewed', label: 'Profils vus', count: null },
  ] as const;

 
  const renderTabContent = () => {
    switch (activeTab) {
      case 'matches':
        return (
          <div>
            { !matches || matches.length  === 0 ? (
              <EmptyState
                icon={
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
                }
                title="Aucun match pour le moment"
                description="Continuez à découvrir de nouveaux profils pour trouver vos matches !"
                action={{
                  label: "Découvrir des profils",
                  onClick: () => window.location.href = '/discover'
                }}
              />
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Vos Matches</h2>
                {matches?.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onUnmatch={(matchId) => {
                      const user = match.target_user || match.user;
                      if (user) {
                        handleUnmatch(matchId, user.id);
                      }
                    }}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'viewers':
        return <ProfileViewers />;

      case 'viewed':
        return <ViewedProfilesList />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Matches & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos matches et consultez vos statistiques de profil
          </p>
        </div>

        <div className="mb-6">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as TabType)}
          />
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}