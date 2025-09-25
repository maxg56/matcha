import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiService } from '@/services/api';
import { webSocketService, MessageType, type MessageHandler } from '@/services/websocket';
import { useAuthStore } from '@/stores/authStore';

// Type pour les données brutes retournées par l'API
interface RawConversation {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message_content: string;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: number;
  conv_id: number;
  sender_id: number;
  msg: string;           // Le backend utilise "msg", pas "content"
  time: string;          // Le backend utilise "time", pas "sent_at"
  read_at?: string;
  is_read?: boolean;     // Peut ne pas être présent dans l'API
}

interface Conversation {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_image?: string;
    is_online: boolean;
    last_seen: string;
  };
  last_message?: Message;
  unread_count: number;
  updated_at: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  isTyping: boolean;
  typingUser: string | null;
}

interface ChatActions {
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: number) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => Promise<void>;
  sendWebSocketMessage: (conversationId: number, content: string) => void;
  markAsRead: (conversationId: number) => Promise<void>;
  setActiveConversation: (conversation: Conversation | null) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: number, updates: Partial<Message>) => void;
  setTyping: (isTyping: boolean, username?: string) => void;
  setConnected: (isConnected: boolean) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  initializeWebSocket: () => void;
  subscribeToConversation: (conversationId: number) => void;
  unsubscribeFromConversation: (conversationId: number) => void;
  reset: () => void;
}

// Fonction pour adapter les données brutes de l'API en format frontend
const adaptRawConversationToConversation = (raw: RawConversation, currentUserId?: number): Conversation => {
  // Déterminer l'ID de l'autre utilisateur
  const otherUserId = currentUserId && raw.user1_id === currentUserId ? raw.user2_id : raw.user1_id;

  return {
    id: raw.id,
    user: {
      id: otherUserId,
      username: `user_${otherUserId}`, // Mock - devrait venir d'une API utilisateur
      first_name: `User${otherUserId}`, // Mock - devrait venir d'une API utilisateur
      last_name: `Surname${otherUserId}`, // Mock - devrait venir d'une API utilisateur
      profile_image: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop`, // Mock
      is_online: Math.random() > 0.5, // Mock - devrait venir d'une API de statut
      last_seen: new Date().toISOString() // Mock
    },
    last_message: raw.last_message_content ? {
      id: 0, // Mock ID
      conv_id: raw.id,
      sender_id: otherUserId, // Assumption - devrait être dans les données
      msg: raw.last_message_content,
      time: raw.last_message_at || raw.updated_at || new Date().toISOString(),
      is_read: false // Mock - devrait venir des données
    } : undefined,
    unread_count: 0, // Mock - devrait être calculé
    updated_at: raw.updated_at
  };
};

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      conversations: [],
      activeConversation: null,
      messages: [],
      isLoading: false,
      error: null,
      isConnected: false,
      isTyping: false,
      typingUser: null,

      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
      setConnected: (isConnected) => set({ isConnected }),
      setActiveConversation: (activeConversation) => set({ activeConversation }),
      clearError: () => set({ error: null }),

      setTyping: (isTyping: boolean, username?: string) => {
        set({
          isTyping,
          typingUser: isTyping ? username || null : null,
        });
      },

      fetchConversations: async () => {
        set({ isLoading: true, error: null });

        try {
          const rawConversations = await apiService.get<RawConversation[]>('/api/v1/chat/conversations');

          // Récupérer l'ID de l'utilisateur actuel depuis le store d'auth
          const currentUserId = useAuthStore.getState().user?.id;

          // Adapter les données brutes en format frontend
          const conversations = rawConversations.map(raw =>
            adaptRawConversationToConversation(raw, currentUserId)
          );

          set({
            conversations,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch conversations';
          set({
            conversations: [],
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      fetchMessages: async (conversationId: number) => {
        set({ isLoading: true, error: null });
        
        try {
          const messages = await apiService.get<Message[]>(`/api/v1/chat/conversations/${conversationId}/messages`);
          
          set({
            messages: messages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
          set({
            messages: [],
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      sendMessage: async (conversationId: number, content: string) => {
        try {
          const message = await apiService.post<Message>(`/api/v1/chat/messages`, {
            conversation_id: conversationId,
            message: content,
          });
          
          const currentMessages = get().messages;
          set({
            messages: [...currentMessages, message],
          });
          
          await get().fetchConversations();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
          set({ error: errorMessage });
          throw error;
        }
      },

      markAsRead: async (conversationId: number) => {
        try {
          await apiService.put(`/api/v1/chat/conversations/${conversationId}/read`);
          
          const conversations = get().conversations.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unread_count: 0 }
              : conv
          );
          
          const messages = get().messages.map(msg =>
            msg.conv_id === conversationId && !msg.is_read
              ? { ...msg, is_read: true, read_at: new Date().toISOString() }
              : msg
          );
          
          set({ conversations, messages });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to mark as read';
          set({ error: errorMessage });
          throw error;
        }
      },

      addMessage: (message: Message) => {
        const currentMessages = get().messages;
        const messageExists = currentMessages.some(msg => msg.id === message.id);
        
        if (!messageExists) {
          const sortedMessages = [...currentMessages, message].sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
          );
          
          set({ messages: sortedMessages });
          
          const conversations = get().conversations.map(conv => {
            if (conv.id === message.conv_id) {
              return {
                ...conv,
                last_message: message,
                unread_count: message.sender_id !== get().activeConversation?.user?.id
                  ? conv.unread_count + 1
                  : conv.unread_count,
                updated_at: message.time,
              };
            }
            return conv;
          });
          
          set({ conversations: conversations.sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )});
        }
      },

      updateMessage: (messageId: number, updates: Partial<Message>) => {
        const messages = get().messages.map(msg =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        );
        set({ messages });
      },

      sendWebSocketMessage: (conversationId: number, content: string) => {
        const success = webSocketService.sendChatMessage(conversationId.toString(), content);
        if (!success) {
          // Fallback sur l'API HTTP si WebSocket échoue
          get().sendMessage(conversationId, content).catch(error => {
            console.error('Fallback HTTP message failed:', error);
          });
        }
      },

      subscribeToConversation: (conversationId: number) => {
        webSocketService.subscribeToChatConversation(conversationId.toString());
      },

      unsubscribeFromConversation: (conversationId: number) => {
        webSocketService.unsubscribe(`chat_${conversationId}`);
      },

      initializeWebSocket: () => {
        // Handler pour les messages de chat reçus
        const chatMessageHandler: MessageHandler = (data, message) => {
          if (message.type === MessageType.CHAT_MESSAGE) {
            // Convertir les données WebSocket au format Message
            // Fonction utilitaire pour gérer différents formats de timestamp
            const parseTimestamp = (timestamp: any): string => {
              if (typeof timestamp === 'number') {
                // Timestamp Unix (en secondes)
                return new Date(timestamp * 1000).toISOString();
              } else if (typeof timestamp === 'string') {
                // Chaîne de caractères (format ISO ou timestamp)
                const date = new Date(timestamp);
                if (isNaN(date.getTime())) {
                  // Si ce n'est pas une date valide, utiliser la date actuelle
                  console.warn('Invalid timestamp format:', timestamp);
                  return new Date().toISOString();
                }
                return date.toISOString();
              } else {
                // Fallback : utiliser la date actuelle
                console.warn('Unknown timestamp format:', timestamp);
                return new Date().toISOString();
              }
            };

            const chatMessage: Partial<Message> = {
              id: Date.now(), // ID temporaire
              conv_id: parseInt(data.conversation_id),
              sender_id: parseInt(data.from_user),
              msg: data.message,
              time: parseTimestamp(data.timestamp),
              is_read: false
            };
            
            get().addMessage(chatMessage as Message);
          } else if (message.type === MessageType.CHAT_ACK) {
            // Accusé de réception du message envoyé
            console.log('Message acknowledgment received:', data);
          }
        };

        // Handler pour l'état de connexion
        const connectionHandler: MessageHandler = (data) => {
          if (data.status === 'connected') {
            set({ isConnected: true });
            console.log('Chat WebSocket connected');
          }
        };

        // Enregistrer les handlers
        webSocketService.addMessageHandler(MessageType.CHAT_MESSAGE, chatMessageHandler);
        webSocketService.addMessageHandler(MessageType.CHAT_ACK, chatMessageHandler);
        webSocketService.addMessageHandler(MessageType.CONNECTION_ACK, connectionHandler);

        // S'assurer que la connexion WebSocket est établie
        if (!webSocketService.isConnected()) {
          webSocketService.connect().then(() => {
            set({ isConnected: true });
          }).catch(error => {
            console.error('Failed to connect WebSocket for chat:', error);
            set({ isConnected: false });
          });
        } else {
          set({ isConnected: true });
        }
      },

      reset: () => {
        set({
          conversations: [],
          activeConversation: null,
          messages: [],
          isLoading: false,
          error: null,
          isConnected: false,
          isTyping: false,
          typingUser: null,
        });
      },
    }),
    { name: 'ChatStore' }
  )
);

export type { Message, Conversation };