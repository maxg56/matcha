import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { webSocketService, MessageType, type MessageHandler } from '@/services/websocket';

interface UseWebSocketConnectionOptions {
  autoConnect?: boolean;
  reconnectOnAuthChange?: boolean;
}

export function useWebSocketConnection(options: UseWebSocketConnectionOptions = {}) {
  const { autoConnect = true, reconnectOnAuthChange = true } = options;
  const { user } = useAuthStore();
  const connectionAttempted = useRef(false);

  // Connexion automatique quand l'utilisateur est authentifié
  useEffect(() => {
    if (user?.id && autoConnect && !connectionAttempted.current) {
      connectionAttempted.current = true;
      webSocketService.connect().catch(error => {
        console.error('Failed to connect to WebSocket:', error);
        // Réinitialiser pour permettre une nouvelle tentative plus tard
        connectionAttempted.current = false;
      });
    }
  }, [user?.id, autoConnect]);

  // Déconnexion quand l'utilisateur se déconnecte
  useEffect(() => {
    if (!user?.id && connectionAttempted.current) {
      webSocketService.disconnect();
      connectionAttempted.current = false;
    }
  }, [user?.id]);

  // Reconnexion en cas de changement d'authentification
  useEffect(() => {
    if (reconnectOnAuthChange && user?.id && connectionAttempted.current) {
      // Reconnexion avec un délai pour éviter les connexions multiples
      const timer = setTimeout(() => {
        if (!webSocketService.isConnected()) {
          webSocketService.connect().catch(error => {
            console.error('Failed to reconnect to WebSocket:', error);
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [user?.id, reconnectOnAuthChange]);

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      // Ne pas déconnecter automatiquement, garder la connexion pour les autres composants
      // webSocketService.disconnect();
    };
  }, []);

  return webSocketService;
}

// Hook spécialisé pour les notifications
export function useWebSocketNotifications() {
  const ws = useWebSocketConnection();

  useEffect(() => {
    // S'abonner aux notifications au montage
    if (ws.isConnected()) {
      ws.subscribeToNotifications();
    } else {
      // S'abonner dès que la connexion est établie
      const handleConnection = () => {
        ws.subscribeToNotifications();
      };
      
      ws.addMessageHandler(MessageType.CONNECTION_ACK, handleConnection);
      return () => ws.removeMessageHandler(MessageType.CONNECTION_ACK, handleConnection);
    }
  }, [ws]);

  const markAsRead = useCallback((notificationId: string) => {
    return ws.markNotificationAsRead(notificationId);
  }, [ws]);

  const markAllAsRead = useCallback(() => {
    return ws.markAllNotificationsAsRead();
  }, [ws]);

  return {
    markAsRead,
    markAllAsRead,
    addNotificationHandler: (handler: MessageHandler) => {
      // Handler pour tous les types de notifications
      ws.addMessageHandler('notification_event', handler);
      ws.addMessageHandler(MessageType.NOTIFICATION_READ, handler);
      ws.addMessageHandler(MessageType.ALL_NOTIFICATION_READ, handler);
    },
    removeNotificationHandler: (handler: MessageHandler) => {
      ws.removeMessageHandler('notification_event', handler);
      ws.removeMessageHandler(MessageType.NOTIFICATION_READ, handler);
      ws.removeMessageHandler(MessageType.ALL_NOTIFICATION_READ, handler);
    }
  };
}

// Hook spécialisé pour le chat
export function useWebSocketChat(conversationId?: string) {
  const ws = useWebSocketConnection();

  // Souscription à une conversation spécifique
  useEffect(() => {
    if (conversationId && ws.isConnected()) {
      ws.subscribeToChatConversation(conversationId);

      return () => {
        ws.unsubscribe(`chat_${conversationId}`);
      };
    }
  }, [conversationId, ws]);

  const sendMessage = useCallback((conversationId: string, message: string) => {
    return ws.sendChatMessage(conversationId, message);
  }, [ws]);

  return {
    sendMessage,
    addChatHandler: (handler: MessageHandler) => {
      ws.addMessageHandler(MessageType.CHAT_MESSAGE, handler);
      ws.addMessageHandler(MessageType.CHAT_ACK, handler);
    },
    removeChatHandler: (handler: MessageHandler) => {
      ws.removeMessageHandler(MessageType.CHAT_MESSAGE, handler);
      ws.removeMessageHandler(MessageType.CHAT_ACK, handler);
    },
    subscribeTo: (conversationId: string) => ws.subscribeToChatConversation(conversationId),
    unsubscribeFrom: (conversationId: string) => ws.unsubscribe(`chat_${conversationId}`)
  };
}

// Hook pour surveiller l'état de connexion
export function useWebSocketStatus() {
  const ws = useWebSocketConnection({ autoConnect: false });

  return {
    isConnected: ws.isConnected(),
    connectionState: ws.getConnectionState(),
    connect: () => ws.connect(),
    disconnect: () => ws.disconnect(),
    service: ws
  };
}