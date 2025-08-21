import { useState, useEffect } from "react";

type NotificationEntry = [string, number];

export function Notification() {
    function randomInt(max: number): number {
        return Math.floor(Math.random() * max);
    }

    const [seen, setSeen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationEntry[]>([]);

    const userId = "123"; // remplacer par l'ID réel de l'utilisateur
    const evtSource = new EventSource(`http://localhost:8005/api/v1/notifications/stream/${userId}`);

    useEffect(() => {
        evtSource.onmessage = function (event) {
            const notification = JSON.parse(event.data);
            // Ici tu peux afficher la notif dans l'UI
            setNotifications(prev => [...prev, [notification.message, notification.kind]]);
            setSeen(false);
            evtSource.close();
            console.log("rgejreg")
        };
        return () => {
            // evtSource.close();
        };
        
    });

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
