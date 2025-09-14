import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Notification } from "../hooks/ui/NotifImage";
import { PremiumBlur, PremiumUpsellModal } from "@/components/premium";
import { Eye, Heart, Users } from "lucide-react";

export function NotificationButton() {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const { notifications, clearNotifications, seen, setSeen } = Notification();
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    // Mock premium state - in real app, this would come from user store/context
    const [isPremium] = useState(false);

    // Mock data for premium features
    const mockLikes = [
        { name: "Emma", avatar: "👩‍🦰" },
        { name: "Sophie", avatar: "👩‍🦱" },
        { name: "Julia", avatar: "👩‍🦳" },
        { name: "Marie", avatar: "👱‍♀️" },
        { name: "Lisa", avatar: "👩‍🦲" }
    ];

    if (location.pathname === "/login") return null;
    if (location.pathname === "/inscription") return null;

    const maxValue = notifications.length
        ? Math.max(...notifications.map(([, value]) => value))
        : -1;

    let imgSrc = "../ExtinctBrasero.png";

    switch (maxValue) {
        case 0:
            imgSrc = "../BraseroGray.PNG";
            break;
        case 1:
            imgSrc = "../BraseroBlue.PNG";
            break;
        case 2:
            imgSrc = "../BraseroPurple.PNG";
            break;
        case 3:
            imgSrc = "../BraseroRed.PNG";
            break;
        case 4:
            imgSrc = "../BraseroGreen.PNG";
            break;
        default:
            imgSrc = "../ExtinctBrasero.png";
            break;
    }

    if (seen) imgSrc = "../ExtinctBrasero.png";

    const colorMap: { [key: number]: string } = {
        0: "bg-gray-900 text-white",
        1: "bg-blue-900 text-white",
        2: "bg-purple-900 text-white",
        3: "bg-red-900 text-white",
        4: "bg-green-900 text-white",
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
        <div className="fixed top-4 right-4 z-500 ">
            <button onClick={handleClick} className="focus:outline-none">
                <img src={imgSrc} alt="Notifications" className="w-12 h-12" />
            </button>

            {open && (
                <div>
                    <div className="mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
                            <h3 className="font-bold text-lg">Notifications</h3>
                        </div>

                        {/* Regular notifications */}
                        <div className="p-4 space-y-3">
                            {notifications.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Pas de notifications</p>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.slice().reverse().map((n, i) => (
                                        <div key={i} className={`p-2 rounded-lg text-sm ${colorMap[n[1]]} border-l-4 border-current`}>
                                            {n[0]}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Premium "Who likes me" section */}
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Heart className="w-5 h-5 text-pink-500" />
                                <h4 className="font-semibold text-gray-900 dark:text-white">Qui te like</h4>
                                <span className="bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 text-xs px-2 py-1 rounded-full">
                                    {mockLikes.length}
                                </span>
                            </div>

                            <PremiumBlur
                                feature="who-likes-me"
                                isBlurred={!isPremium}
                                onUpgrade={() => setShowPremiumModal(true)}
                                className="rounded-lg"
                            >
                                <div className="grid grid-cols-5 gap-2 py-4">
                                    {mockLikes.map((like, index) => (
                                        <div key={index} className="text-center">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-2xl mb-1">
                                                {like.avatar}
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                {like.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-center py-2">
                                    <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                                        Voir tous les likes →
                                    </button>
                                </div>
                            </PremiumBlur>
                        </div>

                        {/* Profile visits section */}
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Eye className="w-5 h-5 text-blue-500" />
                                <h4 className="font-semibold text-gray-900 dark:text-white">Visites récentes</h4>
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                                    12
                                </span>
                            </div>

                            <PremiumBlur
                                feature="profile-visits"
                                isBlurred={!isPremium}
                                onUpgrade={() => setShowPremiumModal(true)}
                                className="rounded-lg"
                            >
                                <div className="space-y-2 py-2">
                                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                                            A
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Alice</p>
                                            <p className="text-xs text-gray-500">Il y a 2h</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                                            B
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Béatrice</p>
                                            <p className="text-xs text-gray-500">Il y a 5h</p>
                                        </div>
                                    </div>
                                </div>
                            </PremiumBlur>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                            <button
                                className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-4 rounded-lg transition-colors"
                                onClick={clearNotifications}
                            >
                                Effacer toutes les notifications
                            </button>
                        </div>
                    </div>

                    {/* Premium Upsell Modal */}
                    <PremiumUpsellModal
                        isOpen={showPremiumModal}
                        onClose={() => setShowPremiumModal(false)}
                        onUpgrade={() => {
                            console.log('Upgrade to Premium!');
                            setShowPremiumModal(false);
                        }}
                        trigger="like-received"
                        contextData={{
                            likesCount: mockLikes.length
                        }}
                    />
                </div>
            )}
        </div>
    );
}
