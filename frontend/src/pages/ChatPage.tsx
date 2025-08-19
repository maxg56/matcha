import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Video, MoreHorizontal } from 'lucide-react';

const mockMessages = [
  {
    id: '1',
    content: 'Salut ! Comment ça va ? 😊',
    timestamp: '14:30',
    isOwn: false,
    status: 'read' as const,
  },
  {
    id: '2',
    content: 'Salut Emma ! Ça va très bien merci 😄 Et toi ?',
    timestamp: '14:32',
    isOwn: true,
    status: 'read' as const,
  },
  {
    id: '3',
    content: 'Super ! J\'ai vu que tu aimais la photographie, moi aussi ! Tu as un appareil préféré ?',
    timestamp: '14:33',
    isOwn: false,
    status: 'read' as const,
  },
  {
    id: '4',
    content: 'Oui j\'adore ça ! J\'utilise principalement un Canon R6, et toi ?',
    timestamp: '14:35',
    isOwn: true,
    status: 'delivered' as const,
  },
];

const mockMatch = {
  id: '1',
  name: 'Emma',
  image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
  isOnline: true,
};

export default function ChatPage() {
  const { } = useParams(); // matchId unused for now
  const navigate = useNavigate();
  const [messages, setMessages] = useState(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isOwn: true,
      status: 'sent' as const,
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleBack = () => {
    navigate('/messages');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Custom header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ">
        <div className="flex items-center justify-between h-16 px-4 ">
          <TopBar 
            title=""
            showBack={true}
            onBack={handleBack}
            rightAction={
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            }
          />
          
          {/* Match info */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10 ring-2 ring-white/20">
                <AvatarImage src={mockMatch.image} alt={mockMatch.name} />
                <AvatarFallback>{mockMatch.name[0]}</AvatarFallback>
              </Avatar>
              {mockMatch.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background shadow-lg" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{mockMatch.name}</h3>
              <p className="text-xs text-primary">En ligne</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-1 max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        placeholder="Tapez votre message..."
      />
    </div>
  );
}