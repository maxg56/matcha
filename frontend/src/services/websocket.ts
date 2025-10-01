import { WebSocketConnection } from './websocket/connection';
import { MessageHandlerManager } from './websocket/messageHandler';
import { ChatService } from './websocket/chatService';
import { NotificationService } from './websocket/notificationService';
import { SubscriptionService } from './websocket/subscriptionService';
import {
  type WebSocketMessage,
  type WebSocketResponse,
  type MessageHandler,
  type WebSocketConfig,
  MessageType
} from './websocket/types';

class WebSocketService {
  private connection: WebSocketConnection;
  private messageHandler: MessageHandlerManager;
  private subscriptionService: SubscriptionService;
  public chat: ChatService;
  public notifications: NotificationService;
  private messageQueue: Array<{ message: WebSocketMessage; timestamp: number; retries: number }> = [];
  private maxQueueSize = 100;
  private maxRetries = 3;

  constructor(config?: WebSocketConfig) {
    this.connection = new WebSocketConnection(config);
    this.messageHandler = new MessageHandlerManager();
    this.subscriptionService = new SubscriptionService(this.sendMessage.bind(this));
    this.chat = new ChatService(this.sendMessage.bind(this));
    this.notifications = new NotificationService(this.sendMessage.bind(this));
  }

  async connect(): Promise<void> {
    await this.connection.connect(
      () => {
        this.subscriptionService.resubscribeAll();
        this.flushMessageQueue();
      },
      (event) => this.handleMessage(event),
      (event) => this.handleClose(event),
      (error) => this.handleError(error)
    );
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketResponse = JSON.parse(event.data);
      // console.log('WebSocket: Message received', message);

      // Handle pong messages specifically for connection health
      if (message.type === 'pong') {
        this.connection.onPong();
        return;
      }

      this.messageHandler.distributeMessage(message);
    } catch (error) {
      console.error('WebSocket: Failed to parse message', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    // console.log('WebSocket: Connection closed', event);
    // La reconnexion est gérée par WebSocketConnection
  }

  private handleError(error: Event): void {
    console.error('WebSocket: Error occurred', error);
  }


  sendMessage(message: WebSocketMessage): boolean {
    if (!this.connection.isConnected()) {
      // Queue message for later sending when reconnected
      this.queueMessage(message);
      // console.log('WebSocket: Message queued (not connected)', message.type);
      return false;
    }

    const sent = this.connection.send(JSON.stringify(message));
    if (sent) {
      // console.log('WebSocket: Message sent', message);
    } else {
      // Connection might have dropped, queue the message
      this.queueMessage(message);
      // console.log('WebSocket: Message queued (send failed)', message.type);
    }
    return sent;
  }

  addMessageHandler(type: string, handler: MessageHandler): void {
    this.messageHandler.addMessageHandler(type, handler);
  }

  removeMessageHandler(type: string, handler: MessageHandler): void {
    this.messageHandler.removeMessageHandler(type, handler);
  }

  clearHandlers(): void {
    this.messageHandler.clear();
  }

  sendChatMessage(conversationId: string, message: string): boolean {
    return this.chat.sendChatMessage(conversationId, message);
  }

  markNotificationAsRead(notificationId: string): boolean {
    return this.notifications.markNotificationAsRead(notificationId);
  }

  markAllNotificationsAsRead(): boolean {
    return this.notifications.markAllNotificationsAsRead();
  }

  subscribe(channel: string): boolean {
    return this.subscriptionService.subscribe(channel);
  }

  unsubscribe(channel: string): boolean {
    return this.subscriptionService.unsubscribe(channel);
  }

  ping(): boolean {
    return this.sendMessage({
      type: MessageType.PING,
      data: {}
    });
  }

  isConnected(): boolean {
    return this.connection.isConnected();
  }

  getConnectionState(): number | null {
    return this.connection.getConnectionState();
  }

  disconnect(): void {
    this.subscriptionService.clear();
    this.messageHandler.clear();
    this.connection.disconnect();
  }

  subscribeToNotifications(): boolean {
    return this.notifications.subscribeToNotifications();
  }

  subscribeToChatConversation(conversationId: string): boolean {
    return this.chat.subscribeToChatConversation(conversationId);
  }

  addReaction(messageId: number, emoji: string): boolean {
    return this.chat.addReaction(messageId, emoji);
  }

  removeReaction(messageId: number, emoji: string): boolean {
    return this.chat.removeReaction(messageId, emoji);
  }

  subscribeToUserUpdates(): boolean {
    return this.subscriptionService.subscribeToUserUpdates();
  }

  private queueMessage(message: WebSocketMessage): void {
    if (this.messageQueue.length >= this.maxQueueSize) {
      // Remove oldest message
      this.messageQueue.shift();
      console.warn('WebSocket: Message queue full, removed oldest message');
    }

    this.messageQueue.push({
      message,
      timestamp: Date.now(),
      retries: 0
    });
  }

  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) {
      return;
    }

    // console.log(`WebSocket: Flushing ${this.messageQueue.length} queued messages`);

    const messagesToSend = [...this.messageQueue];
    this.messageQueue = [];

    messagesToSend.forEach(({ message, retries }) => {
      if (retries < this.maxRetries) {
        const sent = this.connection.send(JSON.stringify(message));
        if (sent) {
          // console.log('WebSocket: Queued message sent', message.type);
        } else {
          // Re-queue with increased retry count
          this.messageQueue.push({
            message,
            timestamp: Date.now(),
            retries: retries + 1
          });
        }
      } else {
        console.warn('WebSocket: Dropped message after max retries', message.type);
      }
    });
  }

  getConnectionHealth(): Record<string, unknown> {
    return this.connection.getConnectionHealth();
  }

  getQueueStatus(): { size: number; maxSize: number } {
    return {
      size: this.messageQueue.length,
      maxSize: this.maxQueueSize
    };
  }
}

// Instance singleton du service WebSocket
export const webSocketService = new WebSocketService();

// Hook React pour utiliser le WebSocket
export function useWebSocket() {
  return webSocketService;
}

// Re-exports des types pour la compatibilité
export type {
  WebSocketMessage,
  WebSocketResponse,
  MessageHandler,
  WebSocketConfig
} from './websocket/types';

export { MessageType } from './websocket/types';