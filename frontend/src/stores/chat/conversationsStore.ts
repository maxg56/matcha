import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Conversation } from '@/types/chat';
import { chatApi } from '@/services/chat/chatApi';

interface ConversationsState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

interface ConversationsActions {
  fetchConversations: () => Promise<void>;
  setActiveConversation: (conversation: Conversation | null) => void;
  updateConversation: (conversationId: number, updates: Partial<Conversation>) => void;
  updateConversationUnreadCount: (conversationId: number, unreadCount: number) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

type ConversationsStore = ConversationsState & ConversationsActions;

export const useConversationsStore = create<ConversationsStore>()(
  devtools(
    (set, get) => ({
      conversations: [],
      activeConversation: null,
      isLoading: false,
      error: null,

      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
      setActiveConversation: (activeConversation) => set({ activeConversation }),
      clearError: () => set({ error: null }),

      fetchConversations: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const conversations = await chatApi.fetchConversations();
          
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

      updateConversation: (conversationId: number, updates: Partial<Conversation>) => {
        const conversations = get().conversations.map(conv =>
          conv.id === conversationId ? { ...conv, ...updates } : conv
        );
        
        // Sort conversations by updated_at
        const sortedConversations = conversations.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        
        set({ conversations: sortedConversations });
        
        // Update active conversation if it's the one being updated
        const activeConversation = get().activeConversation;
        if (activeConversation && activeConversation.id === conversationId) {
          set({ activeConversation: { ...activeConversation, ...updates } });
        }
      },

      updateConversationUnreadCount: (conversationId: number, unreadCount: number) => {
        get().updateConversation(conversationId, { unread_count: unreadCount });
      },
    }),
    { name: 'ConversationsStore' }
  )
);