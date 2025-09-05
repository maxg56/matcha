import { webSocketService, MessageType, type MessageHandler } from '@/services/websocket';
import type { Message } from '@/types/chat';

export class ChatWebSocketService {
  private handlers: MessageHandler[] = [];

  sendMessage(conversationId: number, content: string): boolean {
    return webSocketService.sendChatMessage(conversationId.toString(), content);
  }

  subscribeToConversation(conversationId: number): void {
    webSocketService.subscribeToChatConversation(conversationId.toString());
  }

  unsubscribeFromConversation(conversationId: number): void {
    webSocketService.unsubscribe(`chat_${conversationId}`);
  }

  initializeWebSocket(callbacks: {
    onMessage: (message: Message) => void;
    onMessageAck: (data: unknown) => void;
    onConnected: () => void;
  }): void {
    const chatMessageHandler: MessageHandler = (data, message) => {
      if (message.type === MessageType.CHAT_MESSAGE) {
        const chatMessage: Partial<Message> = {
          id: Date.now(), // ID temporaire
          conversation_id: parseInt(data.conversation_id),
          sender_id: parseInt(data.from_user),
          content: data.message,
          sent_at: new Date(data.timestamp * 1000).toISOString(),
          is_read: false
        };
        
        callbacks.onMessage(chatMessage as Message);
      } else if (message.type === MessageType.CHAT_ACK) {
        callbacks.onMessageAck(data);
      }
    };

    const connectionHandler: MessageHandler = (data) => {
      if (data.status === 'connected') {
        callbacks.onConnected();
      }
    };

    // Store handlers for cleanup
    this.handlers = [chatMessageHandler, connectionHandler];

    // Register handlers
    webSocketService.addMessageHandler(MessageType.CHAT_MESSAGE, chatMessageHandler);
    webSocketService.addMessageHandler(MessageType.CHAT_ACK, chatMessageHandler);
    webSocketService.addMessageHandler(MessageType.CONNECTION_ACK, connectionHandler);

    // Ensure WebSocket connection
    if (!webSocketService.isConnected()) {
      webSocketService.connect().then(() => {
        callbacks.onConnected();
      }).catch(error => {
        console.error('Failed to connect WebSocket for chat:', error);
      });
    } else {
      callbacks.onConnected();
    }
  }

  cleanup(): void {
    // Remove handlers
    this.handlers.forEach(handler => {
      webSocketService.removeMessageHandler(MessageType.CHAT_MESSAGE, handler);
      webSocketService.removeMessageHandler(MessageType.CHAT_ACK, handler);
      webSocketService.removeMessageHandler(MessageType.CONNECTION_ACK, handler);
    });
    this.handlers = [];
  }

  isConnected(): boolean {
    return webSocketService.isConnected();
  }
}

export const chatWebSocket = new ChatWebSocketService();