import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Notification } from "./../hooks/NotifImage";

export function NotificationButton() {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const { notifications, hasNotification, clearNotifications } = Notification();

    if (location.pathname === "/Accueil") return null;
    if (location.pathname === "/InscriptionPage") return null;

    const imgSrc = hasNotification ? "LightedBrasero.png" : "ExtinctBrasero.png";

    const handleClick = () => {
        setOpen(prev => !prev);
        if (!open) clearNotifications(); 
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <button onClick={handleClick} className="focus:outline-none">
                <img src={imgSrc} alt="Notifications" className="w-12 h-12" />
            </button>

            {open && (
                <div className="mt-2 w-64 bg-white shadow-lg rounded-lg p-4">
                    {notifications.length === 0 ? (
                        <p className="text-gray-500">Pas de notifications</p>
                    ) : (
                        <ul className="space-y-2">
                            {notifications.map((n, i) => (
                                <li key={i} className="text-gray-800">{n}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
