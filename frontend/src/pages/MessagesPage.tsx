import { NewMatchesSection, ConversationsList } from '@/components/messages';
import { useMessagesData } from '@/hooks/useMessagesData';
import { useMobile } from '@/hooks/useMobile';
import { LoadingState, ErrorState } from '@/components/ui';
import { convertUIMatchToComponentMatch } from '@/utils/matchConversions';


export default function MessagesPage() {
  const isMobile = useMobile(925);
  const { newMatches, conversations, loading, error, handleMatchClick, refetch } = useMessagesData();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const newMatchesForUI = newMatches.map(convertUIMatchToComponentMatch);
  const conversationsForUI = conversations.map(convertUIMatchToComponentMatch);


  if (isMobile) {
    return (
      <div className="flex flex-col bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
        {/* Nouveaux matchs en haut */}
        <div className="p-4 border-b border-border">
          <NewMatchesSection
            matches={newMatchesForUI}
            onMatchClick={handleMatchClick}
            isMobile={true}
          />
        </div>

        {/* Conversations qui scrollent */}
        <div className="flex-1 overflow-y-auto p-4 ">
          <ConversationsList
            matches={conversationsForUI}
            onMatchClick={handleMatchClick}
            isMobile={true}
          />
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <>
      <div className="flex bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
        <NewMatchesSection
          matches={newMatchesForUI}
          onMatchClick={handleMatchClick}
          isMobile={false}
        />
        <ConversationsList
          matches={conversationsForUI}
          onMatchClick={handleMatchClick}
          isMobile={false}
        />
      </div>
    
    </>
  );
}

