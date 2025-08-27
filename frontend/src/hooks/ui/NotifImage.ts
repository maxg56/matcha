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
        // Don't create EventSource if user is not authenticated
        if (!user?.id) {
            return;
        }

        const evtSource = new EventSource(`/api/v1/notifications/stream/${user.id}`);

        evtSource.onmessage = function (event) {
            const notification = JSON.parse(event.data);
            // Ici tu peux afficher la notif dans l'UI
            setNotifications(prev => [...prev, [notification.message, notification.kind]]);
            setSeen(false);
            evtSource.close();
            console.log("rgejreg")
        };

        return () => {
            evtSource.close();
        };
        
    }, [user?.id]);

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
