import { apiService } from '@/services/api';
import type { Conversation, Message } from '@/types/chat';

export class ChatApiService {
  async fetchConversations(): Promise<Conversation[]> {
    return apiService.get<Conversation[]>('/api/v1/chat/conversations');
  }

  async fetchMessages(conversationId: number): Promise<Message[]> {
    const messages = await apiService.get<Message[]>(`/api/v1/chat/conversations/${conversationId}/messages`);
    return messages.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
  }

  async sendMessage(conversationId: number, content: string): Promise<Message> {
    return apiService.post<Message>(`/api/v1/chat/conversations/${conversationId}/messages`, {
      content,
    });
  }

  async markAsRead(conversationId: number): Promise<void> {
    return apiService.put(`/api/v1/chat/conversations/${conversationId}/read`);
  }

  async createConversation(participantId: number): Promise<Conversation> {
    return apiService.post<Conversation>('/api/v1/chat/conversations', {
      participant_id: participantId,
    });
  }
}

export const chatApi = new ChatApiService();