import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Notification } from "./../hooks/NotifImage";

export function NotificationButton() {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const { notifications, clearNotifications, seen, setSeen } = Notification();

    if (location.pathname === "/Accueil") return null;
    if (location.pathname === "/InscriptionPage") return null;

    const maxValue = notifications.length
        ? Math.max(...notifications.map(([, value]) => value))
        : -1;

    let imgSrc = "ExtinctBrasero.png";

    switch (maxValue) {
        case 0:
            imgSrc = "BraseroGray.PNG";
            break;
        case 1:
            imgSrc = "BraseroBlue.PNG";
            break;
        case 2:
            imgSrc = "BraseroPurple.PNG";
            break;
        case 3:
            imgSrc = "BraseroRed.PNG";
            break;
        case 4:
            imgSrc = "BraseroGreen.PNG";
            break;
        default:
            imgSrc = "ExtinctBrasero.png";
            break;
    }

    if (seen) imgSrc = "ExtinctBrasero.png";

    const colorMap: { [key: number]: string } = {
        0: "bg-gray-500 text-white",
        1: "bg-blue-500 text-white",
        2: "bg-purple-500 text-white",
        3: "bg-red-500 text-white",
        4: "bg-green-500 text-white",
        "-1": "text-gray-800",
    };

    const handleClick = () => {
        setOpen((prev) => {
            const newState = !prev;
            if (!newState) {
                setSeen(true);
            }
            return newState;
        });
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <button onClick={handleClick} className="focus:outline-none">
                <img src={imgSrc} alt="Notifications" className="w-12 h-12" />
            </button>

            {open && (
                <div>
                    <div className="h-48 mt-2 w-64 overflow-y-auto bg-white shadow-lg rounded-lg p-4">
                        {notifications.length === 0 ? (
                            <p className="text-gray-500">Pas de notifications</p>
                        ) : (
                            <ul className="space-y-0.5">
                                {notifications.slice().reverse().map((n, i) => (
                                    <li key={i} className={colorMap[n[1]]}>
                                        {n[0]}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="text-right">
                        <button
                            className="bg-amber-200 ml-auto rounded"
                            onClick={clearNotifications}
                        >
                            clear all
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
