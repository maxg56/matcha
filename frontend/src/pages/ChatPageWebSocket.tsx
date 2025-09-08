import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { WebSocketStatus } from '@/components/WebSocketStatus';
import { useChatStore, type Message } from '@/stores/chatStore';
import { useWebSocketChat } from '@/hooks/useWebSocketConnection';

// Type pour les messages de l'interface UI (compatible avec ChatBubble)
interface UIMessage {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
}

export default function ChatPageWebSocket() {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Store et hooks WebSocket
  const { 
    activeConversation, 
    messages, 
    isLoading, 
    error,
    isConnected,
    fetchMessages, 
    setActiveConversation,
    subscribeToConversation,
    unsubscribeFromConversation,
    sendWebSocketMessage 
  } = useChatStore();
  
  const { addChatHandler, removeChatHandler } = useWebSocketChat(matchId);
  
  // État local pour l'UI
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll automatique quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialisation de la conversation
  useEffect(() => {
    if (matchId) {
      const conversationId = parseInt(matchId);
      
      // Charger les messages existants
      fetchMessages(conversationId).catch(error => {
        console.error('Failed to load messages:', error);
      });
      
      // S'abonner aux nouveaux messages WebSocket
      subscribeToConversation(conversationId);
      
      // Mock de conversation active pour l'exemple
      setActiveConversation({
        id: conversationId,
        user: {
          id: 123,
          username: 'emma',
          first_name: 'Emma',
          last_name: 'Dubois',
          profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
          is_online: true,
          last_seen: new Date().toISOString()
        },
        unread_count: 0,
        updated_at: new Date().toISOString()
      });
      
      return () => {
        unsubscribeFromConversation(conversationId);
      };
    }
  }, [matchId, fetchMessages, subscribeToConversation, unsubscribeFromConversation, setActiveConversation]);

  // Handler pour les messages WebSocket entrants
  useEffect(() => {
    const chatHandler = (data: any, message: any) => {
      if (message.type === 'chat_message') {
        console.log('Nouveau message WebSocket reçu:', data);
        // Le message sera automatiquement ajouté au store via chatStore
      } else if (message.type === 'chat_ack') {
        console.log('Accusé de réception:', data);
        setIsTyping(false);
      }
    };

    addChatHandler(chatHandler);
    return () => removeChatHandler(chatHandler);
  }, [addChatHandler, removeChatHandler]);

  // Convertir les messages du store au format UI
  const uiMessages: UIMessage[] = messages.map((msg: Message) => ({
    id: msg.id.toString(),
    content: msg.content,
    timestamp: new Date(msg.sent_at).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    isOwn: msg.sender_id === activeConversation?.user.id,
    status: msg.is_read ? 'read' : 'delivered'
  }));

  const handleSendMessage = (content: string) => {
    if (!matchId) return;
    
    const conversationId = parseInt(matchId);
    setIsTyping(true);
    
    // Envoyer via WebSocket
    sendWebSocketMessage(conversationId, content);
  };

  const handleBack = () => {
    navigate('/app/messages');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement de la conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="mb-4">Erreur lors du chargement: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* WebSocket Status (mode debug) */}
      {import.meta.env.DEV && (
        <div className="p-2">
          <WebSocketStatus />
        </div>
      )}

      {/* Custom header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-16 w-full">
          <TopBar 
            title=""
            showBack={true}
            onBack={handleBack}
          />
          
          {/* Match info */}
          {activeConversation && (
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-8 h-8 ring-2 ring-white/20">
                  <AvatarImage src={activeConversation.user.profile_image} alt={activeConversation.user.first_name} />
                  <AvatarFallback>{activeConversation.user.first_name[0]}</AvatarFallback>
                </Avatar>
                {activeConversation.user.is_online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background shadow-lg" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{activeConversation.user.first_name}</h3>
                <div className="text-xs flex items-center gap-1">
                  {!isConnected && <span className="text-red-500">⚠️ Hors ligne</span>}
                  {isConnected && activeConversation.user.is_online && <span className="text-green-500">🟢 En ligne</span>}
                  {isConnected && !activeConversation.user.is_online && <span className="text-gray-500">Hors ligne</span>}
                  {isTyping && <span className="text-primary">tape...</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-1 max-w-4xl mx-auto">
          {uiMessages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>Aucun message pour le moment.</p>
              <p className="text-sm">Envoyez le premier message pour commencer la conversation !</p>
            </div>
          )}
          
          {uiMessages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          
          {isTyping && (
            <div className="flex justify-center py-2">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">Envoi en cours...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        placeholder={isConnected ? "Tapez votre message..." : "Connexion en cours..."}
        disabled={!isConnected}
      />
    </div>
  );
}