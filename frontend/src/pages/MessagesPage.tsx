import { useState, useEffect } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileModal } from '@/components/demo/ProfileModal';

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
    navigate(`/chat/${matchId}`);
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <ResponsiveLayout title="Messages" showNavigation={true}>
          <div className="p-4">
            {newMatches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Nouveaux Matches</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {newMatches.map((match) => (
                    <div 
                      key={match.id}
                      className="flex-shrink-0 w-20 text-center cursor-pointer"
                      onClick={() => handleMatchClick(match.id)}
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-2 mb-2">
                        <Avatar className="w-16 h-16 mx-auto">
                          <AvatarImage src={match.image} alt={match.name} />
                          <AvatarFallback>{match.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <p className="text-xs font-medium text-foreground truncate">{match.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <MobileMessagesList matches={messagesMatches} onMatchClick={handleMatchClick} onProfileClick={handleProfileClick} />
          </div>
        </ResponsiveLayout>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ResponsiveLayout title="Messages" showNavigation={true} maxWidth="full">
      <div className="flex h-full">
          {/* New matches horizontal feed */}
          {newMatches.length > 0 && (
            <div className="w-80 border-r border-gray-200 dark:border-gray-700">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 m-4">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold text-foreground">Nouveaux Matches</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {newMatches.length} nouvelle{newMatches.length > 1 ? 's' : ''} connexion{newMatches.length > 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="p-4 space-y-4">
                  {newMatches.map((match) => (
                    <div
                      key={match.id}
                      className="bg-gray-50 dark:bg-gray-700 p-3 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-all duration-300 border border-gray-200 dark:border-gray-600"
                      onClick={() => handleMatchClick(match.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={match.image} alt={match.name} />
                          <AvatarFallback>{match.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{match.name}, {match.age}</p>
                            {match.isNew && (
                              <Badge className="text-xs bg-primary/20 text-primary border-primary/30">Nouveau</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{match.matchedAt}</p>
                          <div className="flex gap-1 mt-1">
                            {match.commonInterests.slice(0, 2).map((interest) => (
                              <Badge key={interest} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages panel */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 m-4 flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Conversations</h2>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-3">
                  {messagesMatches.map((match) => (
                    <div
                      key={match.id}
                      onClick={() => handleMatchClick(match.id)}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-all duration-300 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={match.image} alt={match.name} />
                          <AvatarFallback>{match.name[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-foreground truncate">
                              {match.name}, {match.age}
                            </h3>
                            <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                              {match.timestamp}
                            </span>
                          </div>
                          
                          {match.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">
                              {match.lastMessage}
                            </p>
                          )}
                          
                          <div className="flex gap-1 mt-1">
                            {match.commonInterests.slice(0, 2).map((interest) => (
                              <Badge key={interest} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {match.unread && (
                          <div className="w-3 h-3 bg-primary rounded-full shadow-lg" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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

function MobileMessagesList({ matches, onMatchClick, onProfileClick }: { 
  matches: typeof mockMatches;
  onMatchClick: (id: string) => void;
  onProfileClick: (match: typeof mockMatches[0]) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">Conversations</h2>
      </div>
      
      <div className="space-y-3">
        {matches.map((match) => (
          <div
            key={match.id}
            onClick={() => onMatchClick(match.id)}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onProfileClick(match);
                  }}
                >
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={match.image} alt={match.name} />
                    <AvatarFallback>{match.name[0]}</AvatarFallback>
                  </Avatar>
                </button>
                {match.unread && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background shadow-lg" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-foreground truncate">
                    {match.name}, {match.age}
                  </h3>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                    {match.timestamp}
                  </span>
                </div>
                
                {match.lastMessage && (
                  <p className="text-sm text-muted-foreground truncate mb-2">
                    {match.lastMessage}
                  </p>
                )}
                
                <div className="flex gap-1">
                  {match.commonInterests.slice(0, 2).map((interest) => (
                    <Badge key={interest} variant="outline" className="text-xs glass">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}