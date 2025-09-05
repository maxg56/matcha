import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileModal } from '@/components/demo/ProfileModal';
import { NewMatchesSection, ConversationsList } from '@/components/messages';
import { useMessages, type MessageMatch } from '@/hooks/api/useMessages';

export default function MessagesPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MessageMatch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use real API data instead of mock data
  const { newMatches, conversationMatches, isLoading, error, refreshData } = useMessages();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 925);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMatchClick = (matchId: string) => {
    navigate(`/app/chat/${matchId}`);
  };

  const handleProfileClick = (match: MessageMatch) => {
    setSelectedProfile(match);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProfile(null);
  };

  // Handle loading and error states
  if (isLoading && newMatches.length === 0 && conversationMatches.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center text-red-600">
          <p className="mb-4">Erreur lors du chargement: {error}</p>
          <button 
            onClick={refreshData} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-full bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
        {/* Nouveaux matchs en haut */}
        <div className="p-4 border-b border-border">
          <NewMatchesSection 
            matches={newMatches} 
            onMatchClick={handleMatchClick} 
            isMobile={true}
          />
        </div>

        {/* Conversations qui scrollent */}
        <div className="flex-1 overflow-y-auto p-4">
          <ConversationsList 
            matches={conversationMatches} 
            onMatchClick={handleMatchClick} 
            onProfileClick={handleProfileClick}
            isMobile={true}
          />
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <>
      <div className="flex min-h-full bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  min-h-screen">
        <NewMatchesSection 
          matches={newMatches} 
          onMatchClick={handleMatchClick} 
          isMobile={false}
        />
        <ConversationsList 
          matches={conversationMatches} 
          onMatchClick={handleMatchClick} 
          onProfileClick={handleProfileClick}
          isMobile={false}
        />
      </div>
    
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onLike={(id) => console.log('Liked:', id)}
          onPass={(id) => console.log('Passed:', id)}
        />
      )}
    </>
  );
}

