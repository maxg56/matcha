import { MessageType, type WebSocketMessage } from './types';

export class ChatService {
  private sendMessage: (message: WebSocketMessage) => boolean;
  
  constructor(sendMessage: (message: WebSocketMessage) => boolean) {
    this.sendMessage = sendMessage;
  }

  sendChatMessage(conversationId: string, message: string): boolean {
    return this.sendMessage({
      type: MessageType.CHAT,
      data: {
        conversation_id: conversationId,
        message: message
      }
    });
  }

  subscribeToChatConversation(conversationId: string): boolean {
    return this.subscribe(`chat_${conversationId}`);
  }

  private subscribe(channel: string): boolean {
    return this.sendMessage({
      type: MessageType.SUBSCRIBE,
      data: channel
    });
  }
}