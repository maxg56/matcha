import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Message } from '@/types/chat';
import { chatApi } from '@/services/chat/chatApi';

interface MessagesState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

interface MessagesActions {
  fetchMessages: (conversationId: number) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: number, updates: Partial<Message>) => void;
  markMessagesAsRead: (conversationId: number) => Promise<void>;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

type MessagesStore = MessagesState & MessagesActions;

export const useMessagesStore = create<MessagesStore>()(
  devtools(
    (set, get) => ({
      messages: [],
      isLoading: false,
      error: null,

      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
      clearError: () => set({ error: null }),
      clearMessages: () => set({ messages: [] }),

      fetchMessages: async (conversationId: number) => {
        set({ isLoading: true, error: null });
        
        try {
          const messages = await chatApi.fetchMessages(conversationId);
          
          set({
            messages,
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
          const message = await chatApi.sendMessage(conversationId, content);
          
          const currentMessages = get().messages;
          set({
            messages: [...currentMessages, message],
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
          set({ error: errorMessage });
          throw error;
        }
      },

      addMessage: (message: Message) => {
        const currentMessages = get().messages;
        const messageExists = currentMessages.some(msg => msg.id === message.id);
        
        if (!messageExists) {
          const sortedMessages = [...currentMessages, message].sort(
            (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
          );
          
          set({ messages: sortedMessages });
        }
      },

      updateMessage: (messageId: number, updates: Partial<Message>) => {
        const messages = get().messages.map(msg =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        );
        set({ messages });
      },

      markMessagesAsRead: async (conversationId: number) => {
        try {
          await chatApi.markAsRead(conversationId);
          
          const messages = get().messages.map(msg => 
            msg.conversation_id === conversationId && !msg.is_read
              ? { ...msg, is_read: true, read_at: new Date().toISOString() }
              : msg
          );
          
          set({ messages });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to mark messages as read';
          set({ error: errorMessage });
          throw error;
        }
      },
    }),
    { name: 'MessagesStore' }
  )
);