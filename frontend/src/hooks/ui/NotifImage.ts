import { useState, useEffect, useCallback } from "react";
import { useWebSocketNotifications } from '../useWebSocketConnection';
import { MessageType, type MessageHandler } from '@/services/websocket';

type NotificationEntry = [string, number];

export function Notification() {
    const [seen, setSeen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationEntry[]>([]);

    const { user } = useAuthStore();
    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        console.log("Notification hook mounted", user?.id, token);
        // Ne crée pas de WebSocket si l'utilisateur n'est pas authentifié
        if (!user?.id || !token) {
            return;

        }
    }, []);

    // Configuration des handlers de notification
    useEffect(() => {
        addNotificationHandler(notificationHandler);
        
        return () => {
            removeNotificationHandler(notificationHandler);
        };
    }, [addNotificationHandler, removeNotificationHandler, notificationHandler]);


    const clearNotifications = async () => {
        setNotifications([]);
        const response = await fetch(
        `https://localhost:8443/api/v1/notifications/delete?user_id=${user.id}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        const data = await response.json();
        console.log("Réponse backend:", data);
    }

    return { notifications, clearNotifications, seen, setSeen };
}
