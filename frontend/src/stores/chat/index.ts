export { useConversationsStore } from './conversationsStore';
export { useMessagesStore } from './messagesStore';
export { useChatConnectionStore } from './chatConnectionStore';

// Combined hook for easier usage
export const useChatStore = () => {
  const conversations = useConversationsStore();
  const messages = useMessagesStore();
  const connection = useChatConnectionStore();
  
  return {
    // Conversations
    conversations: conversations.conversations,
    activeConversation: conversations.activeConversation,
    fetchConversations: conversations.fetchConversations,
    setActiveConversation: conversations.setActiveConversation,
    updateConversation: conversations.updateConversation,
    updateConversationUnreadCount: conversations.updateConversationUnreadCount,
    
    // Messages
    messages: messages.messages,
    fetchMessages: messages.fetchMessages,
    sendMessage: messages.sendMessage,
    addMessage: messages.addMessage,
    updateMessage: messages.updateMessage,
    markAsRead: messages.markMessagesAsRead,
    clearMessages: messages.clearMessages,
    
    // Connection
    isConnected: connection.isConnected,
    isTyping: connection.isTyping,
    typingUser: connection.typingUser,
    setConnected: connection.setConnected,
    setTyping: connection.setTyping,
    sendWebSocketMessage: connection.sendWebSocketMessage,
    subscribeToConversation: connection.subscribeToConversation,
    unsubscribeFromConversation: connection.unsubscribeFromConversation,
    initializeWebSocket: connection.initializeWebSocket,
    
    // Combined state
    isLoading: conversations.isLoading || messages.isLoading,
    error: conversations.error || messages.error,
    clearError: () => {
      conversations.clearError();
      messages.clearError();
    },
  };
};

// Re-export types
export type { Message, Conversation } from '@/types/chat';