export interface WebSocketMessage {
  type: string;
  data?: any;
  to?: string;
  from?: string;
  // Chat specific fields (for backward compatibility)
  conversation_id?: string;
  content?: string;
  is_typing?: boolean;
  // Reaction specific fields
  message_id?: number;
  emoji?: string;
}

export interface WebSocketResponse {
  type: string;
  data: any;
  channel?: string;
  user_id?: string;
  from_user?: string;
}

export const MessageType = {
  // Client vers serveur
  CHAT: 'chat',
  NOTIFICATION: 'notification',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  PING: 'ping',
  SEND_MESSAGE: 'send_message',
  JOIN_CONVERSATION: 'join_conversation',
  TYPING: 'typing',
  REACTION_ADD: 'reaction_add',
  REACTION_REMOVE: 'reaction_remove',

  // Premium Chat Features
  TYPING_INDICATOR: 'typing_indicator',
  READ_RECEIPT: 'read_receipt',
  MESSAGES_READ: 'messages_read',
  PRIORITY_MESSAGE: 'priority_message',

  // Serveur vers client
  CHAT_MESSAGE: 'chat_message',
  CHAT_ACK: 'chat_ack',
  NEW_MESSAGE: 'new_message',
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_READ: 'notification_marked_read',
  ALL_NOTIFICATION_READ: 'all_notifications_marked_read',
  SUBSCRIPTION_ACK: 'subscription_ack',
  UNSUBSCRIPTION_ACK: 'unsubscription_ack',
  PONG: 'pong',
  CONNECTION_ACK: 'connection_ack',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  REACTION_UPDATE: 'reaction_update',
  PRESENCE_UPDATE: 'presence_update',
  ERROR: 'error',

  // Premium Features - Server responses
  READ_RECEIPT_RECEIVED: 'read_receipt_received',
  TYPING_STATUS: 'typing_status',
  MESSAGE_STATUS: 'message_status'
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

export type MessageHandler = (data: any, message: WebSocketResponse) => void;

export interface WebSocketConfig {
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  connectionTimeout?: number;
}

export const WebSocketState = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
} as const;

export type WebSocketState = typeof WebSocketState[keyof typeof WebSocketState];

// Message reaction types
export interface MessageReaction {
  id: number;
  message_id: number;
  user_id: number;
  emoji: string;
  created_at: string;
}

export interface ReactionData {
  message_id: number;
  user_id: number;
  emoji: string;
}

export interface ReactionSummary {
  message_id: number;
  reactions: Record<string, ReactionInfo>;
}

export interface ReactionInfo {
  count: number;
  users: number[];
  has_user: boolean;
}

// User presence types
export interface UserPresence {
  user_id: number;
  is_online: boolean;
  last_seen?: string;
  last_activity: string;
}

export interface PresenceData {
  user_id: number;
  is_online: boolean;
  last_seen?: string;
}