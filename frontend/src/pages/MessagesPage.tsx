import { useState, useEffect } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { useNavigate } from 'react-router-dom';
import { ProfileModal } from '@/components/demo/ProfileModal';
import { NewMatchesSection, ConversationsList } from '@/components/messages';

const mockMatches = [
  {
    id: '1',
    name: 'Emma',
    age: 25,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=600&fit=crop'
    ],
    bio: 'Passionnée de photographie et de voyages 📸✈️ J\'adore capturer des moments uniques et explorer de nouveaux horizons. Toujours à la recherche de la prochaine aventure !',
    location: 'Paris',
    occupation: 'Photographe',
    interests: ['Photographie', 'Voyage', 'Art', 'Cuisine'],
    distance: 2,
    lastMessage: 'Salut ! Comment ça va ? 😊',
    timestamp: '14:30',
    unread: true,
    matchedAt: 'Il y a 2 heures',
    commonInterests: ['Photographie', 'Voyage'],
    isNew: false,
  },
  {
    id: '2',
    name: 'Sophie',
    age: 28,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=400&h=600&fit=crop'
    ],
    bio: 'Designer UX/UI qui adore créer des expériences uniques et innovantes. Passionnée par l\'interaction entre technologie et créativité.',
    location: 'Lyon',
    occupation: 'UX Designer',
    interests: ['Design', 'Tech', 'Fitness', 'Lecture'],
    distance: 5,
    lastMessage: 'Merci pour le super moment hier !',
    timestamp: 'Hier',
    unread: false,
    matchedAt: 'Hier',
    commonInterests: ['Design', 'Café'],
    isNew: false,
  },
  {
    id: '3',
    name: 'Julie',
    age: 24,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop'
    ],
    lastMessage: 'À bientôt pour un café ☕',
    timestamp: 'Mar',
    unread: false,
    matchedAt: 'Il y a 2 jours',
    commonInterests: ['Yoga', 'Art'],
    isNew: false,
  },
  {
    id: '4',
    name: 'Camille',
    age: 26,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop'
    ],
    lastMessage: null, // Nouveau match sans message
    timestamp: null,
    unread: false,
    matchedAt: 'Il y a 1 heure',
    commonInterests: ['Fitness', 'Cuisine'],
    isNew: true,
  }
];

export default function MessagesPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<typeof mockMatches[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMatchClick = (matchId: string) => {
    navigate(`/app/chat/${matchId}`);
  };

  const handleProfileClick = (match: typeof mockMatches[0]) => {
    setSelectedProfile(match);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProfile(null);
  };

  const newMatches = mockMatches.filter(m => !m.lastMessage);
  const messagesMatches = mockMatches.filter(m => m.lastMessage);

if (isMobile) {
  return (
    <ResponsiveLayout title="Messages" showNavigation={true}>
      <div className="flex flex-col h-full">
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
            matches={messagesMatches} 
            onMatchClick={handleMatchClick} 
            onProfileClick={handleProfileClick}
            isMobile={true}
          />
        </div>
      </div>
    </ResponsiveLayout>
  );
}


  // Desktop layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ResponsiveLayout title="Messages" showNavigation={true} maxWidth="full">
        <div className="flex h-full">
          <NewMatchesSection 
            matches={newMatches} 
            onMatchClick={handleMatchClick} 
            isMobile={false}
          />
          <ConversationsList 
            matches={messagesMatches} 
            onMatchClick={handleMatchClick} 
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
      </ResponsiveLayout>
    </div>
  );
}

