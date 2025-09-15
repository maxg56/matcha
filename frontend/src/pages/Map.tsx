import { useState } from "react";
import { UserMap } from "@/components/map/UserMap";
import { LocationFilters } from "@/components/map/LocationFilters";
import { type NearbyUser, type SearchFilters } from "@/services/locationService";

export default function MapPage() {
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchRadius, setSearchRadius] = useState(50);

  const handleUserClick = (user: NearbyUser) => {
    setSelectedUser(user);
    console.log('Utilisateur sélectionné:', user);
  };

  const handleFiltersChange = (filters: SearchFilters) => {
    if (filters.max_distance) {
      setSearchRadius(filters.max_distance);
    }
  };

  return (
    <div className="min-h-screen text-foreground bg-white dark:bg-gray-800">
      <div className="flex h-screen">
        {/* Panneau de filtres (rétractable) */}
        {showFilters && (
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filtres</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  ✕
                </button>
              </div>
              <LocationFilters
                onFiltersChange={handleFiltersChange}
                initialFilters={{ max_distance: searchRadius }}
              />
            </div>
          </div>
        )}

        {/* Zone principale */}
        <div className="flex-1 flex flex-col">
          {/* En-tête */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold">Carte des utilisateurs</h1>
              </div>
        
          
            {/* Informations utilisateur sélectionné */}
            {selectedUser && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Utilisateur sélectionné
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 dark:text-blue-200">
                      {selectedUser.first_name} (@{selectedUser.username}) - {selectedUser.age} ans
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      📍 À {selectedUser.distance.toFixed(1)} km de vous
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
              searchRadius={searchRadius}
              onUserClick={handleUserClick}
              showCurrentLocation={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
