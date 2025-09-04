import { MessageHandler, WebSocketResponse } from './types';

export class MessageHandlerManager {
  private messageHandlers = new Map<string, MessageHandler[]>();

  addMessageHandler(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  removeMessageHandler(type: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  distributeMessage(message: WebSocketResponse): void {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => {
      try {
        handler(message.data, message);
      } catch (error) {
        console.error(`WebSocket: Handler error for ${message.type}`, error);
      }
    });
  }

  clear(): void {
    this.messageHandlers.clear();
  }

  hasHandlers(type: string): boolean {
    return this.messageHandlers.has(type) && this.messageHandlers.get(type)!.length > 0;
  }
}