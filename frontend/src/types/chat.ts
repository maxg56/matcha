export interface UserInfo {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export interface Conversation {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message: string;
  last_message_at: string | null;
  unread_count: number;
  other_user: UserInfo;
  created_at: string;
}

export interface Message {
  id: number;
  conv_id: number;
  sender_id: number;
  message: string;
  time: string;
  read_at: string | null;
  sender_info?: UserInfo;
}

export interface MessagesResponse {
  messages: Message[];
  has_more: boolean;
  total: number;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  has_more: boolean;
  total: number;
}

export interface MessageRequest {
  conversation_id: number;
  message: string;
}

export interface ConversationRequest {
  user_id: number;
}

export interface ConversationCreatedResponse {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message_content: string;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageSentResponse {
  message: {
    id: number;
    conv_id: number;
    sender_id: number;
    msg: string;
    time: string;
    read_at: string | null;
  };
  delivered: boolean;
  recipients: number[];
}