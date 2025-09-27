import { MessageType, type WebSocketMessage } from './types';

export class ChatService {
  private sendMessage: (message: WebSocketMessage) => boolean;
  
  constructor(sendMessage: (message: WebSocketMessage) => boolean) {
    this.sendMessage = sendMessage;
  }

  sendChatMessage(conversationId: string, message: string): boolean {
    return this.sendMessage({
      type: MessageType.SEND_MESSAGE,
      conversation_id: parseInt(conversationId),
      content: message
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

  addReaction(messageId: number, emoji: string): boolean {
    return this.sendMessage({
      type: MessageType.REACTION_ADD,
      message_id: messageId,
      emoji: emoji
    });
  }

  removeReaction(messageId: number, emoji: string): boolean {
    return this.sendMessage({
      type: MessageType.REACTION_REMOVE,
      message_id: messageId,
      emoji: emoji
    });
  }
}