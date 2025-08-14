import { useState, useEffect } from "react";

export function Notification() {
    const [notifications, setNotifications] = useState<string[]>([]);
    const [hasNotification, setHasNotification] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const newNotif = `Nouvelle notification ${notifications.length + 1}`;
            setNotifications(prev => [...prev, newNotif]);
            setHasNotification(true);
        }, 5000);

        return () => clearInterval(interval);
    }, [notifications.length]);

    const clearNotifications = () => {
        setNotifications([]);
        setHasNotification(false);
    };

    return { notifications, hasNotification, clearNotifications };
}
