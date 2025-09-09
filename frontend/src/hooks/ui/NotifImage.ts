import { useState, useEffect } from "react";
import { useWebSocketNotifications } from '../useWebSocketConnection';
import { type MessageHandler } from '@/services/websocket';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

export function Notification() {
    const [seen, setSeen] = useState(false);

    const { user } = useAuthStore();
    const token = localStorage.getItem('accessToken');
    const { addNotificationHandler, removeNotificationHandler } = useWebSocketNotifications();
    
    // Utilisation du store Zustand pour les notifications
    const { 
        notifications, 
        addNotification, 
        clearAll,
        unreadCount 
    } = useNotificationStore();

    // Handler pour traiter les notifications reçues
    const notificationHandler: MessageHandler = (data) => {
        console.log("Notification received:", data);
        // Traiter la notification reçue via WebSocket
        if (data.type === 'notification_event') {
            addNotification({
                type: data.notificationType || 'message',
                message: data.message || 'New notification',
                userId: data.userId,
            });
        }
    };

    useEffect(() => {
        console.log("Notification hook mounted", user?.id, token);
        // Ne crée pas de WebSocket si l'utilisateur n'est pas authentifié
        if (!user?.id || !token) {
            return;
        }
    }, [user?.id, token]);

    // Configuration des handlers de notification
    useEffect(() => {
        if (user?.id && token) {
            addNotificationHandler(notificationHandler);
            
            return () => {
                removeNotificationHandler(notificationHandler);
            };
        }
    }, [user?.id, token, addNotificationHandler, removeNotificationHandler, notificationHandler]);


    const clearNotifications = async () => {
        if (!user?.id || !token) {
            console.warn("Cannot clear notifications: user not authenticated");
            return;
        }

        clearAll();
        try {
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
        } catch (error) {
            console.error("Failed to clear notifications:", error);
        }
    }

    return { 
        notifications, 
        clearNotifications, 
        seen, 
        setSeen, 
        unreadCount 
    };
}
