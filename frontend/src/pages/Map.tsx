import { useState } from "react";
import { UserMap } from "@/components/map/UserMap";
import { type NearbyUser } from "@/services/locationService";

export default function MapPage() {
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);

  const handleUserClick = (user: NearbyUser) => {
    setSelectedUser(user);
    console.log('Match sélectionné:', user);
  };

  return (
    <div className="min-h-screen text-foreground bg-white dark:bg-gray-800">
      <div className="flex h-screen">
        {/* Zone principale */}
        <div className="flex-1 flex flex-col">
          {/* En-tête */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Carte de vos matches</h1>
            </div>

            {/* Informations utilisateur sélectionné */}
            {selectedUser && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Match sélectionné
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 dark:text-blue-200">
                      {selectedUser.first_name} (@{selectedUser.username}) - {selectedUser.age} ans
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      📍 À {Math.round(selectedUser.distance)} km de vous
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Carte */}
          <div className="flex-1">
            <UserMap
              onUserClick={handleUserClick}
              showCurrentLocation={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
