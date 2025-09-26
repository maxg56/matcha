import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiService } from '@/services/api';
import { webSocketService, MessageType, type MessageHandler } from '@/services/websocket';
import type { MessageReaction, UserPresence } from '@/services/websocket/types';

// Types pour les données retournées par l'API (maintenant enrichies)
interface ConversationResponse {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message: string;
  last_message_at: string | null;
  unread_count: number;
  other_user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  created_at: string;
}

interface ConversationListResponse {
  conversations: ConversationResponse[];
  has_more: boolean;
  total: number;
}

interface Message {
  id: number;
  conv_id: number;
  sender_id: number;
  msg: string;           // Le backend utilise "msg", pas "content"
  time: string;          // Le backend utilise "time", pas "sent_at"
  read_at?: string;
  is_read?: boolean;     // Peut ne pas être présent dans l'API
  reactions?: MessageReaction[];
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
  // Reaction methods
  addReaction: (messageId: number, emoji: string) => Promise<void>;
  removeReaction: (messageId: number, emoji: string) => Promise<void>;
  sendReactionWebSocket: (messageId: number, emoji: string, action: 'add' | 'remove') => void;
  updateMessageReactions: (messageId: number, reactions: MessageReaction[]) => void;
  // Presence methods
  updateUserPresence: (userId: number, presence: UserPresence) => void;
  setUserOnline: (userId: number) => Promise<void>;
  setUserOffline: (userId: number) => Promise<void>;
  reset: () => void;
}

// Fonction pour adapter les données enrichies de l'API en format frontend
const adaptConversationResponseToConversation = (response: ConversationResponse): Conversation => {
  // Construire le nom complet à partir de first_name et last_name
  const fullName = `${response.other_user.first_name} ${response.other_user.last_name}`.trim();

  return {
    id: response.id,
    user: {
      id: response.other_user.id,
      username: response.other_user.username,
      first_name: response.other_user.first_name,
      last_name: response.other_user.last_name,
      profile_image: response.other_user.avatar || '/default-avatar.png',
      is_online: false, // À implémenter via presence
      last_seen: new Date().toISOString()
    },
    last_message: response.last_message ? {
      id: 0, // Mock ID - peut être amélioré
      conv_id: response.id,
      sender_id: response.other_user.id, // Assumption
      msg: response.last_message,
      time: response.last_message_at || response.created_at,
      is_read: response.unread_count === 0
    } : undefined,
    unread_count: response.unread_count,
    updated_at: response.last_message_at || response.created_at
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
          const response = await apiService.get<ConversationListResponse>('/api/v1/chat/conversations');

          // Adapter les données enrichies en format frontend
          const conversations = response.conversations.map(adaptConversationResponseToConversation);

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

          console.log('ChatStore: fetchMessages response:', {
            conversationId,
            messagesCount: messages.length,
            messagesWithReactions: messages.filter(m => m.reactions && m.reactions.length > 0).length,
            sampleMessage: messages[0],
            allMessages: messages.map(m => ({ id: m.id, hasReactions: !!m.reactions, reactionsCount: m.reactions?.length || 0 }))
          });

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

        // Handler pour les réactions
        const reactionHandler: MessageHandler = (data, message) => {
          if (message.type === MessageType.REACTION_UPDATE) {
            console.log('Reaction update received:', data);

            try {
              // Extraire les données de la réaction
              const messageId = data.message_id;
              const userId = data.user_id;
              const emoji = data.emoji;
              const action = data.action; // 'add' ou 'remove'
              const timestamp = data.timestamp || Date.now();

              if (!messageId || !userId || !emoji || !action) {
                console.warn('Incomplete reaction update data:', data);
                return;
              }

              // Mettre à jour les réactions pour le message
              const messages = get().messages;
              const updatedMessages = messages.map(msg => {
                if (msg.id === messageId) {
                  let reactions = msg.reactions || [];

                  if (action === 'add') {
                    // Ajouter la réaction si elle n'existe pas déjà
                    const existingReaction = reactions.find(r => r.user_id === userId && r.emoji === emoji);
                    if (!existingReaction) {
                      reactions = [...reactions, {
                        id: Math.random(), // ID temporaire
                        message_id: messageId,
                        user_id: userId,
                        emoji: emoji,
                        created_at: new Date(timestamp).toISOString()
                      }];
                    }
                  } else if (action === 'remove') {
                    // Supprimer la réaction
                    reactions = reactions.filter(r => !(r.user_id === userId && r.emoji === emoji));
                  }

                  return { ...msg, reactions };
                }
                return msg;
              });

              // Mettre à jour le store
              set({ messages: updatedMessages });
            } catch (error) {
              console.error('Error processing reaction update:', error);
            }
          }
        };

        // Handler pour le statut de présence
        const presenceHandler: MessageHandler = (data, message) => {
          if (message.type === MessageType.PRESENCE_UPDATE) {
            const presenceData = data as { user_id: number; is_online: boolean; last_seen?: string };
            get().updateUserPresence(presenceData.user_id, {
              user_id: presenceData.user_id,
              is_online: presenceData.is_online,
              last_seen: presenceData.last_seen,
              last_activity: new Date().toISOString()
            });
          }
        };

        // Enregistrer les handlers
        webSocketService.addMessageHandler(MessageType.CHAT_MESSAGE, chatMessageHandler);
        webSocketService.addMessageHandler(MessageType.CHAT_ACK, chatMessageHandler);
        webSocketService.addMessageHandler(MessageType.NEW_MESSAGE, chatMessageHandler);
        webSocketService.addMessageHandler(MessageType.CONNECTION_ACK, connectionHandler);
        webSocketService.addMessageHandler(MessageType.CONNECTED, connectionHandler);
        webSocketService.addMessageHandler(MessageType.REACTION_UPDATE, reactionHandler);
        webSocketService.addMessageHandler(MessageType.PRESENCE_UPDATE, presenceHandler);

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

      // Reaction methods
      addReaction: async (messageId: number, emoji: string) => {
        try {
          await apiService.post('/api/v1/chat/reactions', {
            message_id: messageId,
            emoji
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add reaction';
          set({ error: errorMessage });
          throw error;
        }
      },

      removeReaction: async (messageId: number, emoji: string) => {
        try {
          await apiService.delete(`/api/v1/chat/messages/${messageId}/reactions/${emoji}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove reaction';
          set({ error: errorMessage });
          throw error;
        }
      },

      sendReactionWebSocket: (messageId: number, emoji: string, action: 'add' | 'remove') => {
        console.log('ChatStore: sendReactionWebSocket called:', { messageId, emoji, action, isConnected: webSocketService.isConnected() });

        if (!webSocketService.isConnected()) {
          console.log('ChatStore: WebSocket not connected, using HTTP fallback');
          // Fallback to HTTP API
          if (action === 'add') {
            get().addReaction(messageId, emoji);
          } else {
            get().removeReaction(messageId, emoji);
          }
          return;
        }

        // Send via WebSocket - Format attendu par le backend
        const message = {
          type: action === 'add' ? MessageType.REACTION_ADD : MessageType.REACTION_REMOVE,
          message_id: messageId,
          emoji
        };
        console.log('ChatStore: Sending WebSocket message:', message);
        webSocketService.sendMessage(message);
      },

      updateMessageReactions: (messageId: number, reactions: MessageReaction[]) => {
        const messages = get().messages.map(msg =>
          msg.id === messageId ? { ...msg, reactions } : msg
        );
        set({ messages });
      },

      // Presence methods
      updateUserPresence: (userId: number, presence: UserPresence) => {
        const conversations = get().conversations.map(conv =>
          conv.user.id === userId
            ? {
                ...conv,
                user: {
                  ...conv.user,
                  is_online: presence.is_online,
                  last_seen: presence.last_seen || conv.user.last_seen
                }
              }
            : conv
        );
        set({ conversations });
      },

      setUserOnline: async (userId: number) => {
        try {
          await apiService.put('/api/v1/chat/presence/online');
          get().updateUserPresence(userId, {
            user_id: userId,
            is_online: true,
            last_activity: new Date().toISOString()
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to set user online';
          set({ error: errorMessage });
          throw error;
        }
      },

      setUserOffline: async (userId: number) => {
        try {
          await apiService.put('/api/v1/chat/presence/offline');
          get().updateUserPresence(userId, {
            user_id: userId,
            is_online: false,
            last_seen: new Date().toISOString(),
            last_activity: new Date().toISOString()
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to set user offline';
          set({ error: errorMessage });
          throw error;
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