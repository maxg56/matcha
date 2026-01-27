import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { WebSocketStatus } from '@/components/WebSocketStatus';
import { useChatStore, type Message } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useWebSocketChat } from '@/hooks/useWebSocketConnection';

// Type pour les messages de l'interface UI (compatible avec ChatBubble)
interface UIMessage {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
  reactions?: import('@/services/websocket/types').MessageReaction[];
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
    fetchConversations,
    fetchMessages,
    setActiveConversation,
    subscribeToConversation,
    unsubscribeFromConversation,
    sendWebSocketMessage
  } = useChatStore();

  const { user } = useAuthStore();
  
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
      const initializeConversation = async () => {
        try {
          // Récupérer toutes les conversations de l'utilisateur
          await fetchConversations();
          const allConversations = useChatStore.getState().conversations;

          // Chercher une conversation existante avec ce match/utilisateur
          // Pour l'instant, on utilise matchId comme conversationId
          // TODO: Implémenter la logique pour trouver la vraie conversation basée sur le matchId
          const conversationId = parseInt(matchId);
          const existingConversation = allConversations.find(conv => conv.id === conversationId);

          if (existingConversation && existingConversation.user) {
            // Conversation trouvée avec données utilisateur complètes, charger les messages
            setActiveConversation(existingConversation);
            await fetchMessages(conversationId);
            subscribeToConversation(conversationId);
          } else {
            // Conversation non trouvée ou données manquantes
            console.error(`Conversation ${conversationId} not found or missing user data`);
            navigate('/app/messages');
            return;
          }
        } catch (error) {
          console.error('Failed to initialize conversation:', error);
        }
      };

      initializeConversation();

      return () => {
        const conversationId = parseInt(matchId);
        unsubscribeFromConversation(conversationId);
      };
    }
  }, [matchId, fetchConversations, fetchMessages, subscribeToConversation, unsubscribeFromConversation, setActiveConversation, navigate]);

  // Handler pour les messages WebSocket entrants
  useEffect(() => {
    const chatHandler = (data: unknown, message: { type: string }) => {
      if (message.type === 'chat_message') {
        // console.log('Nouveau message WebSocket reçu:', data);
        // Le message sera automatiquement ajouté au store via chatStore
      } else if (message.type === 'chat_ack') {
        // console.log('Accusé de réception:', data);
        setIsTyping(false);
      }
    };

    addChatHandler(chatHandler);
    return () => removeChatHandler(chatHandler);
  }, [addChatHandler, removeChatHandler]);

  // Convertir les messages du store au format UI
  const uiMessages: UIMessage[] = messages.map((msg: Message) => {
    // Gestion sécurisée des dates
    const messageDate = msg.time ? new Date(msg.time) : new Date();
    const isValidDate = messageDate instanceof Date && !isNaN(messageDate.getTime());

    return {
      id: msg.id.toString(),
      content: msg.msg,        // Utilise "msg" au lieu de "content"
      timestamp: isValidDate
        ? messageDate.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })
        : '--:--',
      isOwn: msg.sender_id === user?.id,
      status: msg.is_read ? 'read' : 'delivered',
      reactions: msg.reactions || []
    };
  });

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
      {/* Custom header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-16 w-full">
          <TopBar 
            title=""
            showBack={true}
            onBack={handleBack}
          />
          
          {/* Match info */}
          {activeConversation && activeConversation.user && (
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
        <div className="max-w-4xl mx-auto min-h-full">
          {uiMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4">
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-lg mb-2">Aucun message pour le moment</p>
                <p className="text-sm">Envoyez le premier message pour commencer la conversation !</p>
              </div>
            </div>
          )}

          <div className="py-4">
            {uiMessages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}

            {isTyping && (
              <div className="flex justify-start px-4 mb-3">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">en train d'écrire...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

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