import { apiService } from './api';
import type {
  Conversation,
  ConversationListResponse,
  MessagesResponse,
  MessageRequest,
  ConversationRequest,
  ConversationCreatedResponse,
  MessageSentResponse
} from '@/types/chat';

export class ChatApi {
  /**
   * Get all conversations for the current user
   */
  async getUserConversations(): Promise<Conversation[]> {
    const response = await apiService.get<ConversationListResponse>('/api/v1/chat/conversations');
    console.log('Raw API response for conversations:', response);
    return response?.conversations || [];
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: number): Promise<Conversation> {
    return apiService.get<Conversation>(`/api/v1/chat/conversations/${conversationId}`);
  }

  /**
   * Create a new conversation with a user
   */
  async createConversation(userId: number): Promise<ConversationCreatedResponse> {
    const request: ConversationRequest = { user_id: userId };
    return apiService.post<ConversationCreatedResponse>('/api/v1/chat/conversations', request);
  }

  /**
   * Get messages from a conversation with pagination
   */
  async getMessages(conversationId: number, limit = 50, offset = 0): Promise<MessagesResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    return apiService.get<MessagesResponse>(`/api/v1/chat/conversations/${conversationId}/messages?${params}`);
  }

  /**
   * Send a message to a conversation
   */
  async sendMessage(conversationId: number, message: string): Promise<MessageSentResponse> {
    const request: MessageRequest = {
      conversation_id: conversationId,
      message
    };

    return apiService.post<MessageSentResponse>('/api/v1/chat/messages', request);
  }

  /**
   * Mark messages in a conversation as read
   */
  async markMessagesAsRead(conversationId: number): Promise<{ message: string }> {
    return apiService.put<{ message: string }>(`/api/v1/chat/conversations/${conversationId}/read`);
  }


  /**
   * Get user presence information
   */
  async getUserPresence(userId: number): Promise<{ user_id: number; is_online: boolean; last_seen?: string; last_activity: string }> {await apiService.get<{ user_id: number; is_online: boolean; last_seen?: string; last_activity: string }>(`/api/v1/users/${userId}/online-status`);
    return await apiService.get<{ user_id: number; is_online: boolean; last_seen?: string; last_activity: string }>(`/api/v1/users/${userId}/online-status`);
  }
}

export const chatApi = new ChatApi();