export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  sent_at: string;
  read_at?: string;
  is_read: boolean;
}

export interface Conversation {
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

export interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  isTyping: boolean;
  typingUser: string | null;
}

export interface ChatActions {
  // Conversation management
  fetchConversations: () => Promise<void>;
  setActiveConversation: (conversation: Conversation | null) => void;
  
  // Message management
  fetchMessages: (conversationId: number) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => Promise<void>;
  sendWebSocketMessage: (conversationId: number, content: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: number, updates: Partial<Message>) => void;
  markAsRead: (conversationId: number) => Promise<void>;
  
  // UI state management
  setTyping: (isTyping: boolean, username?: string) => void;
  setConnected: (isConnected: boolean) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  
  // WebSocket management
  initializeWebSocket: () => void;
  subscribeToConversation: (conversationId: number) => void;
  unsubscribeFromConversation: (conversationId: number) => void;
}

export type ChatStore = ChatState & ChatActions;