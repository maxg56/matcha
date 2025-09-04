import { useState, useEffect, useCallback } from "react";
import { useWebSocketNotifications } from '../useWebSocketConnection';
import { MessageType, type MessageHandler } from '@/services/websocket';

type NotificationEntry = [string, number];

export function Notification() {
    const [seen, setSeen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
    const { addNotificationHandler, removeNotificationHandler, markAllAsRead } = useWebSocketNotifications();

    // Handler pour les notifications WebSocket
    const notificationHandler: MessageHandler = useCallback((data, message) => {
        console.log("WebSocket notification reçue:", message);
        
        switch (message.type) {
            case 'notification_event':
                // Nouvelle notification reçue
                if (data.message && typeof data.type === 'number') {
                    setNotifications(prev => [...prev, [data.message, data.type]]);
                    setSeen(false);
                }
                break;
                
            case MessageType.NOTIFICATION_READ:
                // Une notification spécifique a été marquée comme lue
                console.log("Notification marquée comme lue:", data.notification_id);
                break;
                
            case MessageType.ALL_NOTIFICATION_READ:
                // Toutes les notifications ont été marquées comme lues
                console.log("Toutes les notifications marquées comme lues");
                break;
                
            default:
                // Fallback pour les anciens formats de notification
                if (data.message && data.type !== undefined) {
                    setNotifications(prev => [...prev, [data.message, data.type]]);
                    setSeen(false);
                }
        }
    }, []);

    // Configuration des handlers de notification
    useEffect(() => {
        addNotificationHandler(notificationHandler);
        
        return () => {
            removeNotificationHandler(notificationHandler);
        };
    }, [addNotificationHandler, removeNotificationHandler, notificationHandler]);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        // Marquer toutes les notifications comme lues côté serveur
        markAllAsRead();
    }, [markAllAsRead]);

    return { notifications, clearNotifications, seen, setSeen };
}
