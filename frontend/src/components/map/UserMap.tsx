import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { locationService, type NearbyUser } from "@/services/locationService";

interface UserMapProps {
  searchRadius?: number;
  onUserClick?: (user: NearbyUser) => void;
  showCurrentLocation?: boolean;
}

interface MapEventsProps {
  onLocationUpdate: (lat: number, lng: number) => void;
}

function MapEvents({ onLocationUpdate }: MapEventsProps) {
  useMapEvents({
    locationfound: (e: { latlng: { lat: number; lng: number } }) => {
      onLocationUpdate(e.latlng.lat, e.latlng.lng);
    },
    click: (e: { latlng: { lat: number; lng: number } }) => {
      // Permettre à l'utilisateur de cliquer sur la carte pour définir sa position
      if (confirm('Définir cette position comme votre localisation actuelle ?')) {
        onLocationUpdate(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export function UserMap({
  searchRadius = 50,
  onUserClick,
  showCurrentLocation = true
}: UserMapProps) {
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]); // Paris par défaut
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNearbyUsers = useCallback(async (radius: number = searchRadius) => {
    try {
      setLoading(true);
      setError(null);

      const response = await locationService.getNearbyUsers(radius);
      setNearbyUsers(response.users || []); // Fallback to empty array if null/undefined

      // Centrer la carte sur la localisation de recherche
      if (response.center_location) {
        const center: [number, number] = [
          response.center_location.latitude,
          response.center_location.longitude
        ];
        setMapCenter(center);
        setCurrentLocation(center);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs à proximité:', err);

      // Gestion spécifique des erreurs d'authentification
      if (err instanceof Error && err.message.includes('session a expiré')) {
        setError('Votre session a expiré. Veuillez vous reconnecter pour voir les utilisateurs à proximité.');
      } else if (err instanceof Error && err.message.includes('not authenticated')) {
        setError('Vous devez être connecté pour voir les utilisateurs à proximité.');
      } else {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
      }
    } finally {
      setLoading(false);
    }
  }, [searchRadius]);

  const updateUserLocation = useCallback(async () => {
    try {
      setLoading(true);
      await locationService.updateLocationFromBrowser();
      // Recharger les utilisateurs à proximité après la mise à jour
      await loadNearbyUsers();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la localisation:', err);
      setError(err instanceof Error ? err.message : 'Erreur de localisation');
    } finally {
      setLoading(false);
    }
  }, [loadNearbyUsers]);

  const handleLocationUpdate = useCallback((lat: number, lng: number) => {
    setCurrentLocation([lat, lng]);
    setMapCenter([lat, lng]);
  }, []);

  useEffect(() => {
    // Essayer de charger les utilisateurs à proximité
    // Si cela échoue (pas de géolocalisation), c'est normal, l'utilisateur peut toujours rechercher par ville
    loadNearbyUsers();
  }, [loadNearbyUsers]);

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <div className="relative w-full h-full">
      {/* Contrôles */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <button
          onClick={updateUserLocation}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md shadow-lg text-sm font-medium transition-colors"
        >
          {loading ? 'Localisation...' : 'Ma position'}
        </button>

        <button
          onClick={() => loadNearbyUsers()}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md shadow-lg text-sm font-medium transition-colors block w-full"
        >
          {loading ? 'Chargement...' : 'Actualiser'}
        </button>
      </div>

      {/* Indicateur d'erreur */}
      {error && (
        <div className="absolute top-4 left-4 z-[1000] bg-red-500 text-white px-4 py-2 rounded-md shadow-lg max-w-sm">
          <p className="text-sm">{error}</p>
          {error.includes('Géolocalisation') || error.includes('session') ? (
            <p className="text-xs mt-1 text-red-200">
              💡 Cliquez sur la carte pour définir votre position ou utilisez la recherche par ville
            </p>
          ) : null}
          <button
            onClick={() => setError(null)}
            className="text-red-200 hover:text-white ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Aide pour l'utilisateur */}
      {(nearbyUsers?.length === 0 || !nearbyUsers) && !loading && !error && (
        <div className="absolute top-4 left-4 z-[1000] bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg max-w-sm">
          <p className="text-sm">Aucun utilisateur trouvé à proximité.</p>
          <p className="text-xs mt-1 text-blue-200">
            💡 Cliquez sur "Ma position" ou cliquez sur la carte pour définir votre localisation
          </p>
        </div>
      )}

      {/* Compteur d'utilisateurs */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-gray-800 px-3 py-2 rounded-md shadow-lg">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {nearbyUsers?.length || 0} utilisateur{(nearbyUsers?.length || 0) !== 1 ? 's' : ''} à proximité
        </p>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEvents onLocationUpdate={handleLocationUpdate} />

        {/* Marqueur de la position actuelle */}
        {showCurrentLocation && currentLocation && (
          <Marker
            position={currentLocation}
            // Vous pouvez ajouter une icône différente pour la position actuelle
          >
            <Popup>
              <div className="text-center">
                <strong>Votre position</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marqueurs des utilisateurs à proximité */}
        {nearbyUsers?.map((user) => (
          <Marker
            key={user.id}
            position={[user.latitude, user.longitude]}
            eventHandlers={{
              click: () => onUserClick?.(user)
            }}
          >
            <Popup>
              <div className="text-center max-w-xs">
                <div className="font-bold text-lg">{user.first_name}</div>
                <div className="text-gray-600 text-sm">@{user.username}</div>
                <div className="text-gray-600 text-sm">{user.age} ans</div>
                <div className="text-blue-600 font-medium text-sm">
                  📍 {formatDistance(user.distance)}
                </div>
                {user.compatibility_score && (
                  <div className="text-green-600 font-medium text-sm">
                    🤝 {Math.round(user.compatibility_score)}% compatible
                  </div>
                )}
                {user.current_city && (
                  <div className="text-gray-500 text-xs mt-1">
                    {user.current_city}
                  </div>
                )}
                {user.bio && (
                  <div className="text-gray-700 text-xs mt-2 italic">
                    "{user.bio.slice(0, 100)}{user.bio.length > 100 ? '...' : ''}"
                  </div>
                )}
                {user.tags && user.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
