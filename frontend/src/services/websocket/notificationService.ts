import { MessageType, type WebSocketMessage } from './types';

export class NotificationService {
  private sendMessage: (message: WebSocketMessage) => boolean;
  
  constructor(sendMessage: (message: WebSocketMessage) => boolean) {
    this.sendMessage = sendMessage;
  }

  markNotificationAsRead(notificationId: string): boolean {
    return this.sendMessage({
      type: MessageType.NOTIFICATION,
      data: {
        action: 'mark_read',
        notification_id: notificationId
      }
    });
  }

  markAllNotificationsAsRead(): boolean {
    return this.sendMessage({
      type: MessageType.NOTIFICATION,
      data: {
        action: 'mark_all_read'
      }
    });
  }

  subscribeToNotifications(): boolean {
    return this.subscribe('notifications');
  }

  private subscribe(channel: string): boolean {
    return this.sendMessage({
      type: MessageType.SUBSCRIBE,
      data: channel
    });
  }
}