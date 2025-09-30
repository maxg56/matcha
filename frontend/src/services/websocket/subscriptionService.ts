import { MessageType, type WebSocketMessage } from './types';

export class SubscriptionService {
  private subscriptions = new Set<string>();
  private sendMessage: (message: WebSocketMessage) => boolean;

  constructor(sendMessage: (message: WebSocketMessage) => boolean) {
    this.sendMessage = sendMessage;
  }

  subscribe(channel: string): boolean {
    this.subscriptions.add(channel);
    return this.sendMessage({
      type: MessageType.SUBSCRIBE,
      data: { channel }
    });
  }

  unsubscribe(channel: string): boolean {
    this.subscriptions.delete(channel);
    return this.sendMessage({
      type: MessageType.UNSUBSCRIBE,
      data: { channel }
    });
  }

  resubscribeAll(): void {
    this.subscriptions.forEach(channel => {
      this.sendMessage({
        type: MessageType.SUBSCRIBE,
        data: { channel }
      });
    });
  }

  subscribeToUserUpdates(): boolean {
    return this.subscribe('user-updates');
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  clear(): void {
    this.subscriptions.clear();
  }
}