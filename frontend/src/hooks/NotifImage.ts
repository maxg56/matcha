import { useState, useEffect } from "react";




export function Notification() {
    function randomInt(max: number): number {
        return Math.floor(Math.random() * max);
    }
    let [seen, setSeen] = useState(false);
    const [notifications, setNotifications] = useState<string[]>([]);
    const [Color, setColor] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            const newNotif = `Nouvelle notification ${notifications.length + 1}`;
            setColor(randomInt(5));
            setNotifications(prev => [...prev, [newNotif, Color]]);
            setSeen(false)
        }, 2000);

        return () => clearInterval(interval);
    }, [notifications.length]);

    const clearNotifications = () => {
        setNotifications([]);    
    };

    return { notifications, clearNotifications, seen, setSeen};
}
