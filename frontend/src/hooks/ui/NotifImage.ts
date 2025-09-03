import { useState, useEffect } from "react";
import { useAuthStore } from '@/stores/authStore';

type NotificationEntry = [string, number];

export function Notification() {
    function randomInt(max: number): number {
        return Math.floor(Math.random() * max);
    }

    const [seen, setSeen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
    const { user } = useAuthStore();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        console.log("Notification hook mounted", user?.id, token);
        // Ne crée pas de WebSocket si l'utilisateur n'est pas authentifié
        if (!user?.id || !token) {
            return;
        }

        // Connexion WebSocket (adapter l'URL si besoin)
        // const ws = new WebSocket(`wss://localhost:8443/api/v1/notifications/ws/notifications?token=${token}`);
        const ws = new WebSocket(`wss://localhost:8443/ws/notifications?token=${token}`);

        ws.onopen = () => {
            console.log("WebSocket connecté pour les notifications");
        };

        ws.onmessage = (event) => {
            try {
                const notification = JSON.parse(event.data);
                setNotifications(prev => [...prev, [notification.message, notification.type]]);
                setSeen(false);
            } catch (e) {
                console.error("Erreur de parsing notification:", e);
            }
        };

        ws.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        ws.onclose = () => {
            console.log("WebSocket déconnecté");
        };

        return () => {
            ws.close();
        };
    }, [user?.id, user?.token]);

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         const newNotif = `Nouvelle notification ${notifications.length + 1}`;
    //         const newColor = randomInt(5);
    //         setNotifications(prev => [...prev, [newNotif, newColor]]);
    //         setSeen(false);
    //     }, 5000);

    //     return () => clearInterval(interval);
    // }, [notifications.length]);

    const clearNotifications = () => {
        setNotifications([]);
    };

    return { notifications, clearNotifications, seen, setSeen };
}
