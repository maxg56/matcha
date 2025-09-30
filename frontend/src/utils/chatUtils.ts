import type { Message, Conversation } from '@/stores/chatStore';
import type { UserPresence } from '@/services/websocket/types';

// Types pour l'adapter
interface ConversationResponse {
  id: number;
  other_user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  unread_count: number;
}

// Adapter function to convert API response to frontend format
export const adaptConversationResponseToConversation = (response: ConversationResponse): Conversation => {
  return {
    id: response.id,
    user: {
      id: response.other_user.id,
      username: response.other_user.username,
      first_name: response.other_user.first_name,
      last_name: response.other_user.last_name,
      profile_image: response.other_user.avatar || '/default-avatar.png',
      is_online: false,
      last_seen: new Date().toISOString()
    },
    last_message: response.last_message ? {
      id: 0,
      conv_id: response.id,
      sender_id: response.other_user.id,
      msg: response.last_message,
      time: response.last_message_at || response.created_at,
      is_read: response.unread_count === 0
    } : undefined,
    unread_count: response.unread_count,
    updated_at: response.last_message_at || response.created_at
  };
};

// Sort conversations by update time
export const sortConversationsByTime = (conversations: Conversation[]): Conversation[] => {
  return conversations.sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
};

// Sort messages by time
export const sortMessagesByTime = (messages: Message[]): Message[] => {
  return messages.sort((a, b) =>
    new Date(a.time).getTime() - new Date(b.time).getTime()
  );
};

// Parse timestamp utility for WebSocket messages
export const parseTimestamp = (timestamp: unknown): string => {
  if (typeof timestamp === 'number') {
    return new Date(timestamp * 1000).toISOString();
  } else if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp format:', timestamp);
      return new Date().toISOString();
    }
    return date.toISOString();
  } else {
    console.warn('Unknown timestamp format:', timestamp);
    return new Date().toISOString();
  }
};

// Update message reactions
export const updateMessageReactions = (
  messages: Message[],
  messageId: number,
  userId: number,
  emoji: string,
  action: 'add' | 'remove',
  timestamp: number = Date.now()
): Message[] => {
  return messages.map(msg => {
    if (msg.id === messageId) {
      let reactions = msg.reactions || [];

      if (action === 'add') {
        const existingReaction = reactions.find(r => r.user_id === userId && r.emoji === emoji);
        if (!existingReaction) {
          const newReaction = {
            id: Math.random(),
            message_id: messageId,
            user_id: userId,
            emoji: emoji,
            created_at: new Date(timestamp).toISOString()
          };
          reactions = [...reactions, newReaction];
        }
      } else if (action === 'remove') {
        reactions = reactions.filter(r => !(r.user_id === userId && r.emoji === emoji));
      }

      return { ...msg, reactions };
    }
    return msg;
  });
};

// Update conversation with new message
export const updateConversationWithMessage = (
  conversations: Conversation[],
  message: Message,
  activeConversationUserId?: number
): Conversation[] => {
  const updatedConversations = conversations.map(conv => {
    if (conv.id === message.conv_id) {
      return {
        ...conv,
        last_message: message,
        unread_count: message.sender_id !== activeConversationUserId
          ? conv.unread_count + 1
          : conv.unread_count,
        updated_at: message.time,
      };
    }
    return conv;
  });

  return sortConversationsByTime(updatedConversations);
};

// Update conversation unread count
export const markConversationAsRead = (conversations: Conversation[], conversationId: number): Conversation[] => {
  return conversations.map(conv =>
    conv.id === conversationId
      ? { ...conv, unread_count: 0 }
      : conv
  );
};

// Mark messages as read
export const markMessagesAsRead = (messages: Message[], conversationId: number): Message[] => {
  return messages.map(msg =>
    msg.conv_id === conversationId && !msg.is_read
      ? { ...msg, is_read: true, read_at: new Date().toISOString() }
      : msg
  );
};

// Update user presence in conversations
export const updateUserPresenceInConversations = (
  conversations: Conversation[],
  userId: number,
  presence: UserPresence
): Conversation[] => {
  return conversations.map(conv =>
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
};

// Check if message already exists
export const messageExists = (messages: Message[], messageId: number): boolean => {
  return messages.some(msg => msg.id === messageId);
};

// Create error message utility
export const createErrorMessage = (error: unknown, fallback: string): string => {
  return error instanceof Error ? error.message : fallback;
};