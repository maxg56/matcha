import { useState, useEffect } from "react";
import { useWebSocketNotifications } from '../useWebSocketConnection';
import { type MessageHandler } from '@/services/websocket';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { apiService } from '@/services/api';
import { authService } from '@/services/auth';

export function Notification() {
    const [seen, setSeen] = useState(false);

    const { user } = useAuthStore();
    const token = authService.getAccessToken();
    const { addNotificationHandler, removeNotificationHandler } = useWebSocketNotifications();
    
    // Utilisation du store Zustand pour les notifications
    const { 
        notifications, 
        addNotification, 
        clearAll,
        unreadCount 
    } = useNotificationStore();

    // Handler pour traiter les notifications reçues
    const notificationHandler: MessageHandler = (data, message) => {
        // console.log("Notification received:", data, message);
        
        // Traiter les différents types de notifications WebSocket
        if (message?.type === 'notification_received') {
            // Message venant du gateway
            const notifData = data;
            // console.log("Processing notification_received:", notifData);
            
            // Convertir le type de notification numérique en string
            let notifType = 'message';
            switch(notifData.type || notifData.notif_type) {
                case '0':
                    notifType = 'visit';
                    break;
                case '1':
                    notifType = 'like';
                    break;
                case '2':
                    notifType = 'match';
                    break;
                case '3':
                    notifType = 'message';
                    break;
                case '4':
                    notifType = 'unlike';
                    break;
                default:
                    notifType = 'message';
            }
            
            addNotification({
                type: notifType as 'like' | 'match' | 'message' | 'visit' | 'unlike',
                message: typeof notifData.message === 'string' ? notifData.message : 'New notification',
                userId: typeof notifData.to_user_id === 'number' ? notifData.to_user_id 
                       : typeof notifData.from_user_id === 'number' ? notifData.from_user_id 
                       : undefined,
                db: typeof notifData.db === 'boolean' ? notifData.db : false,
            });
            setSeen(false); // Marquer comme non vu
        } else if (data.type === 'notification_event') {
            // Ancien format pour compatibilité
            const notificationType = typeof data.notificationType === 'string' ? data.notificationType : 'message';
            const validTypes: Array<'like' | 'match' | 'message' | 'visit' | 'unlike'> = ['like', 'match', 'message', 'visit', 'unlike'];
            
            addNotification({
                type: validTypes.includes(notificationType as any) ? notificationType as 'like' | 'match' | 'message' | 'visit' | 'unlike' : 'message',
                message: typeof data.message === 'string' ? data.message : 'New notification',
                userId: typeof data.userId === 'number' ? data.userId : undefined,
            });
        }
    };

    useEffect(() => {
        // console.log("Notification hook mounted", user?.id, token);
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
            // Utiliser le service API centralisé
            const data = await apiService.get(`/api/v1/notifications/delete?user_id=${user.id}`);
            // console.log("Réponse backend:", data);
        } catch (error) {
            console.error("Failed to clear notifications:", error);
        }
    }

    // Convertir les notifications du store au format attendu par le composant
    // Format: [message, type_number] où type_number correspond aux couleurs
    const formattedNotifications = notifications.map(notif => {
        // Convertir le type string vers un numéro pour les couleurs
        let typeNumber = -1;
        switch(notif.type) {
            case 'visit':
                typeNumber = 0;
                break;
            case 'like':
                typeNumber = 1;
                break;
            case 'match':
                typeNumber = 2;
                break;
            case 'message':
                typeNumber = 3;
                break;
            case 'unlike':
                typeNumber = 4;
                break;
        }
        return [notif.message, typeNumber] as [string, number];
    });

    return { 
        notifications: formattedNotifications, 
        clearNotifications, 
        seen, 
        setSeen, 
        unreadCount 
    };
}
