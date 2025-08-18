import { useState, useEffect } from "react";

type NotificationEntry = [string, number];

export function Notification() {
    function randomInt(max: number): number {
        return Math.floor(Math.random() * max);
    }

    const [seen, setSeen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationEntry[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newNotif = `Nouvelle notification ${notifications.length + 1}`;
            const newColor = randomInt(5);
            setNotifications(prev => [...prev, [newNotif, newColor]]);
            setSeen(false);
        }, 5000);

        return () => clearInterval(interval);
    }, [notifications.length]);

    const clearNotifications = () => {
        setNotifications([]);
    };

    return { notifications, clearNotifications, seen, setSeen };
}
