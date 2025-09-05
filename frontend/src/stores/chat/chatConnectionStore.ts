import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { chatWebSocket } from '@/services/chat/chatWebSocket';
import { useMessagesStore } from './messagesStore';
import { useConversationsStore } from './conversationsStore';

interface ChatConnectionState {
  isConnected: boolean;
  isTyping: boolean;
  typingUser: string | null;
}

interface ChatConnectionActions {
  setConnected: (isConnected: boolean) => void;
  setTyping: (isTyping: boolean, username?: string) => void;
  sendWebSocketMessage: (conversationId: number, content: string) => void;
  subscribeToConversation: (conversationId: number) => void;
  unsubscribeFromConversation: (conversationId: number) => void;
  initializeWebSocket: () => void;
  cleanup: () => void;
}

type ChatConnectionStore = ChatConnectionState & ChatConnectionActions;

export const useChatConnectionStore = create<ChatConnectionStore>()(
  devtools(
    (set) => ({
      isConnected: false,
      isTyping: false,
      typingUser: null,

      setConnected: (isConnected) => set({ isConnected }),

      setTyping: (isTyping: boolean, username?: string) => {
        set({
          isTyping,
          typingUser: isTyping ? username || null : null,
        });
      },

      sendWebSocketMessage: (conversationId: number, content: string) => {
        const success = chatWebSocket.sendMessage(conversationId, content);
        if (!success) {
          // Fallback to HTTP API if WebSocket fails
          useMessagesStore.getState().sendMessage(conversationId, content).catch(error => {
            console.error('Fallback HTTP message failed:', error);
          });
        }
      },

      subscribeToConversation: (conversationId: number) => {
        chatWebSocket.subscribeToConversation(conversationId);
      },

      unsubscribeFromConversation: (conversationId: number) => {
        chatWebSocket.unsubscribeFromConversation(conversationId);
      },

      initializeWebSocket: () => {
        chatWebSocket.initializeWebSocket({
          onMessage: (message) => {
            // Add message to messages store
            useMessagesStore.getState().addMessage(message);
            
            // Update conversation with new message
            useConversationsStore.getState().updateConversation(message.conversation_id, {
              last_message: message,
              updated_at: message.sent_at,
            });
          },
          onMessageAck: (data) => {
            console.log('Message acknowledgment received:', data);
          },
          onConnected: () => {
            set({ isConnected: true });
            console.log('Chat WebSocket connected');
          },
        });
      },

      cleanup: () => {
        chatWebSocket.cleanup();
        set({ isConnected: false, isTyping: false, typingUser: null });
      },
    }),
    { name: 'ChatConnectionStore' }
  )
);