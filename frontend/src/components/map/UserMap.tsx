import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { locationService, type NearbyUser } from "@/services/locationService";

// Créer des icônes personnalisées
const currentUserIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
      <path fill="#e74c3c" stroke="#c0392b" stroke-width="2" d="M12.5,0C5.6,0,0,5.6,0,12.5c0,6.9,12.5,28.5,12.5,28.5s12.5-21.6,12.5-28.5C25,5.6,19.4,0,12.5,0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
      <circle fill="#e74c3c" cx="12.5" cy="12.5" r="3"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 41" width="41" height="41">
      <ellipse fill="#000" opacity="0.3" cx="20.5" cy="37" rx="18" ry="4"/>
    </svg>
  `),
  shadowSize: [41, 41],
  shadowAnchor: [12, 40]
});

const otherUserIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
      <path fill="#3498db" stroke="#2980b9" stroke-width="2" d="M12.5,0C5.6,0,0,5.6,0,12.5c0,6.9,12.5,28.5,12.5,28.5s12.5-21.6,12.5-28.5C25,5.6,19.4,0,12.5,0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
      <circle fill="#3498db" cx="12.5" cy="12.5" r="3"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 41" width="41" height="41">
      <ellipse fill="#000" opacity="0.3" cx="20.5" cy="37" rx="18" ry="4"/>
    </svg>
  `),
  shadowSize: [41, 41],
  shadowAnchor: [12, 40]
});

const tempLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
      <path fill="#f39c12" stroke="#e67e22" stroke-width="2" stroke-dasharray="4,2" d="M12.5,0C5.6,0,0,5.6,0,12.5c0,6.9,12.5,28.5,12.5,28.5s12.5-21.6,12.5-28.5C25,5.6,19.4,0,12.5,0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
      <circle fill="#f39c12" cx="12.5" cy="12.5" r="3"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 41" width="41" height="41">
      <ellipse fill="#000" opacity="0.3" cx="20.5" cy="37" rx="18" ry="4"/>
    </svg>
  `),
  shadowSize: [41, 41],
  shadowAnchor: [12, 40]
});

interface UserMapProps {
  onUserClick?: (user: NearbyUser) => void;
  showCurrentLocation?: boolean;
}

interface MapEventsProps {
  onLocationUpdate: (lat: number, lng: number) => void;
  isEditMode: boolean;
}

function MapEvents({ onLocationUpdate, isEditMode }: MapEventsProps) {
  useMapEvents({
    locationfound: (e: { latlng: { lat: number; lng: number } }) => {
      onLocationUpdate(e.latlng.lat, e.latlng.lng);
    },
    click: async (e: { latlng: { lat: number; lng: number } }) => {
      if (isEditMode) {
        // En mode édition, juste mettre à jour la position temporaire
        onLocationUpdate(e.latlng.lat, e.latlng.lng);
      } else {
        // Mode normal: demander confirmation et sauvegarder directement
        if (confirm('Définir cette position comme votre localisation actuelle ?')) {
          try {
            // Mettre à jour la localisation sur le serveur
            await locationService.updateLocation({
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            });
            onLocationUpdate(e.latlng.lat, e.latlng.lng);
          } catch (err) {
            console.error('Erreur lors de la mise à jour de la localisation:', err);
            alert('Erreur lors de la mise à jour de votre position. Veuillez réessayer.');
          }
        }
      }
    },
  });
  return null;
}

export function UserMap({
  onUserClick,
  showCurrentLocation = true
}: UserMapProps) {
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null); // Sera défini par la position de l'utilisateur
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempLocation, setTempLocation] = useState<[number, number] | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const loadMatchedUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await locationService.getMatchedUsers();
      setNearbyUsers(response.users || []); // Fallback to empty array if null/undefined

      // Centrer la carte sur la localisation de l'utilisateur
      if (response.center_location) {
        const center: [number, number] = [
          response.center_location.latitude,
          response.center_location.longitude
        ];
        setMapCenter(center);
        setCurrentLocation(center);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des matches:', err);

      // Gestion spécifique des erreurs d'authentification et de localisation
      if (err instanceof Error) {
        if (err.message.includes('session a expiré')) {
          setError('Votre session a expiré. Veuillez vous reconnecter pour voir vos matches.');
        } else if (err.message.includes('not authenticated')) {
          setError('Vous devez être connecté pour voir vos matches.');
        } else if (err.message.includes('user location not set') || err.message.includes('current user location not set')) {
          setError('Localisation requise pour voir les matches. Cliquez sur "Ma position" ou "Utiliser Paris" pour définir votre position.');

          // Si pas de localisation actuelle, essayer d'en définir une automatiquement
          if (!currentLocation) {
            console.log('Tentative de définition automatique de la localisation...');
            try {
              // Essayer d'abord la géolocalisation
              const position = await locationService.getBrowserLocation();
              await locationService.updateLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
              setCurrentLocation([position.coords.latitude, position.coords.longitude]);
              setMapCenter([position.coords.latitude, position.coords.longitude]);
              setError(null);
              console.log('Localisation automatique réussie');
              // Recharger les matches après avoir défini la localisation
              setTimeout(() => loadMatchedUsers(), 1000);
            } catch (autoErr) {
              console.log('Localisation automatique échouée, Paris sera proposé comme option');
            }
          }
        } else {
          setError(err.message);
        }
      } else {
        setError('Erreur lors du chargement des matches');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserLocation = useCallback(async () => {
    try {
      setLoading(true);

      // Récupérer la nouvelle position et centrer la carte
      const position = await locationService.getBrowserLocation();
      const newCoords: [number, number] = [
        position.coords.latitude,
        position.coords.longitude
      ];

      setCurrentLocation(newCoords);
      setMapCenter(newCoords);

      // Mettre à jour la localisation sur le serveur
      await locationService.updateLocationFromBrowser();

      // Recharger les matches après la mise à jour
      await loadMatchedUsers();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la localisation:', err);
      setError(err instanceof Error ? err.message : 'Erreur de localisation');
    } finally {
      setLoading(false);
    }
  }, [loadMatchedUsers]);

  const handleLocationUpdate = useCallback(async (lat: number, lng: number) => {
    if (isEditMode) {
      // En mode édition, juste mettre à jour la position temporaire
      setTempLocation([lat, lng]);
      setHasUnsavedChanges(true);
    } else {
      // Mode normal: mettre à jour directement
      setCurrentLocation([lat, lng]);
      setMapCenter([lat, lng]);

      // Recharger les matches après la mise à jour de la position
      try {
        await loadMatchedUsers();
      } catch (err) {
        console.error('Erreur lors du rechargement des matches:', err);
      }
    }
  }, [isEditMode, loadMatchedUsers]);

  const enterEditMode = useCallback(() => {
    setIsEditMode(true);
    setTempLocation(currentLocation);
    setHasUnsavedChanges(false);
  }, [currentLocation]);

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setTempLocation(null);
    setHasUnsavedChanges(false);
  }, []);

  const saveLocation = useCallback(async () => {
    if (!tempLocation || !hasUnsavedChanges) return;

    try {
      setLoading(true);
      setError(null);

      // Mettre à jour la localisation sur le serveur
      await locationService.updateLocation({
        latitude: tempLocation[0],
        longitude: tempLocation[1]
      });

      // Mettre à jour l'état local
      setCurrentLocation(tempLocation);
      setMapCenter(tempLocation);

      // Sortir du mode édition
      setIsEditMode(false);
      setTempLocation(null);
      setHasUnsavedChanges(false);

      // Recharger les matches
      await loadMatchedUsers();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la localisation:', err);
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  }, [tempLocation, hasUnsavedChanges, loadMatchedUsers]);

  // Initialiser la carte avec la position de l'utilisateur depuis l'API
  const initializeMapWithUserLocation = useCallback(async () => {
    if (isMapInitialized) return;

    try {
      // D'abord, essayer de récupérer la position de l'utilisateur depuis l'API
      const currentLocation = await locationService.getCurrentLocation();
      const userCoords: [number, number] = [
        currentLocation.latitude,
        currentLocation.longitude
      ];

      setCurrentLocation(userCoords);
      setMapCenter(userCoords);
      setIsMapInitialized(true);

      console.log('Carte centrée sur la position de l\'utilisateur (API):', userCoords);
    } catch (err) {
      console.log('Position de l\'utilisateur non disponible via API, essai géolocalisation navigateur:', err);

      try {
        // Fallback: essayer la géolocalisation du navigateur et la sauvegarder automatiquement
        const position = await locationService.getBrowserLocation();
        const userCoords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude
        ];

        // Sauvegarder automatiquement la position récupérée
        try {
          await locationService.updateLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          console.log('Position du navigateur sauvegardée automatiquement');
        } catch (saveErr) {
          console.warn('Erreur lors de la sauvegarde automatique de la position:', saveErr);
        }

        setCurrentLocation(userCoords);
        setMapCenter(userCoords);
        setIsMapInitialized(true);

        console.log('Carte centrée sur la géolocalisation du navigateur:', userCoords);
      } catch (geoErr) {
        console.log('Impossible d\'obtenir la géolocalisation, utilisation de Paris par défaut:', geoErr);
        // Dernier fallback: Paris (ne pas sauvegarder automatiquement Paris)
        const parisCoords: [number, number] = [48.8566, 2.3522];
        setMapCenter(parisCoords);
        setIsMapInitialized(true);

        // Afficher un message pour encourager l'utilisateur à définir sa position
        setError('Localisation non définie. Cliquez sur "Ma position" ou "Utiliser Paris" pour définir votre position.');
      }
    }
  }, [isMapInitialized]);

  useEffect(() => {
    // Initialiser la carte avec la position de l'utilisateur
    initializeMapWithUserLocation();
  }, [initializeMapWithUserLocation]);

  useEffect(() => {
    // Charger les matches seulement après l'initialisation de la carte
    if (isMapInitialized) {
      loadMatchedUsers();
    }
  }, [isMapInitialized, loadMatchedUsers]);

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${Math.round(distance)}km`;
  };

  return (
    <div className="relative w-full h-full">
      {/* Contrôles */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        {!isEditMode ? (
          <>
            <button
              onClick={updateUserLocation}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md shadow-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Localisation...' : 'Ma position'}
            </button>

            <button
              onClick={enterEditMode}
              disabled={loading || !currentLocation}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md shadow-lg text-sm font-medium transition-colors block w-full"
            >
              ✏️ Modifier position
            </button>

            <button
              onClick={() => loadMatchedUsers()}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md shadow-lg text-sm font-medium transition-colors block w-full"
            >
              {loading ? 'Chargement...' : 'Actualiser matches'}
            </button>

            {/* Bouton pour définir Paris comme position par défaut */}
            {((error && error.includes('localisation')) || !currentLocation) && (
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    // Coordonnées de Paris
                    const parisCoords = { latitude: 48.8566, longitude: 2.3522 };
                    await locationService.updateLocation({
                      latitude: parisCoords.latitude,
                      longitude: parisCoords.longitude,
                      city: 'Paris',
                      country: 'France'
                    });
                    setCurrentLocation([parisCoords.latitude, parisCoords.longitude]);
                    setMapCenter([parisCoords.latitude, parisCoords.longitude]);
                    await loadMatchedUsers();
                  } catch (err) {
                    console.error('Erreur lors de la définition de Paris:', err);
                    setError(err instanceof Error ? err.message : 'Erreur de localisation');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md shadow-lg text-sm font-medium transition-colors block w-full"
              >
                📍 Utiliser Paris
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={saveLocation}
              disabled={loading || !hasUnsavedChanges}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md shadow-lg text-sm font-medium transition-colors block w-full"
            >
              {loading ? 'Sauvegarde...' : '💾 Sauvegarder'}
            </button>

            <button
              onClick={exitEditMode}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-md shadow-lg text-sm font-medium transition-colors block w-full"
            >
              ❌ Annuler
            </button>
          </>
        )}
      </div>

      {/* Indicateur d'erreur */}
      {error && (
        <div className="absolute top-4 left-4 z-[1000] bg-red-500 text-white px-4 py-2 rounded-md shadow-lg max-w-sm">
          <p className="text-sm">{error}</p>
          {error.includes('Géolocalisation') || error.includes('localisation') ? (
            <p className="text-xs mt-1 text-red-200">
              💡 Cliquez sur "Ma position" pour activer la géolocalisation, ou sur "Utiliser Paris" comme position par défaut
            </p>
          ) : error.includes('session') ? (
            <p className="text-xs mt-1 text-red-200">
              💡 Cliquez sur la carte pour définir votre position ou utilisez le bouton "Utiliser Paris"
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
          <p className="text-sm">Aucun match trouvé.</p>
          <p className="text-xs mt-1 text-blue-200">
            💡 Vos matches apparaîtront ici lorsque vous en aurez
          </p>
        </div>
      )}

      {/* Instructions pour définir la localisation */}
      {!currentLocation && !loading && !isEditMode && (
        <div className="absolute top-4 left-4 z-[1000] bg-yellow-500 text-white px-4 py-2 rounded-md shadow-lg max-w-sm">
          <p className="text-sm font-medium">📍 Définissez votre position</p>
          <p className="text-xs mt-1 text-yellow-200">
            Cliquez sur "Ma position" ou cliquez n'importe où sur la carte pour définir votre localisation
          </p>
        </div>
      )}

      {/* Indicateur du mode édition */}
      {isEditMode && (
        <div className="absolute top-4 left-4 z-[1000] bg-orange-500 text-white px-4 py-2 rounded-md shadow-lg max-w-sm">
          <p className="text-sm font-medium">✏️ Mode édition activé</p>
          <p className="text-xs mt-1 text-orange-200">
            Cliquez sur la carte pour modifier votre position, puis sauvegardez
          </p>
          {hasUnsavedChanges && (
            <p className="text-xs mt-1 text-orange-100 font-medium">
              ⚠️ Modifications non sauvegardées
            </p>
          )}
        </div>
      )}

      {/* Indicateur de centrage automatique */}
      {!isMapInitialized && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <p className="text-sm font-medium">🌍 Centrage sur votre position...</p>
          </div>
        </div>
      )}

      {/* Compteur de matches */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-gray-800 px-3 py-2 rounded-md shadow-lg">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {nearbyUsers?.length || 0} match{(nearbyUsers?.length || 0) !== 1 ? 's' : ''} sur la carte
        </p>
        {currentLocation && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            📍 Carte centrée sur votre position
          </p>
        )}
      </div>

      {/* Afficher la carte seulement quand la position est connue */}
      {mapCenter && (
        <MapContainer
          center={mapCenter}
          zoom={12}
          className="rounded-lg map-container-full"
        >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEvents onLocationUpdate={handleLocationUpdate} isEditMode={isEditMode} />

        {/* Marqueur de la position actuelle */}
        {showCurrentLocation && currentLocation && !isEditMode && (
          <Marker
            position={currentLocation}
            icon={currentUserIcon}
          >
            <Popup>
              <div className="text-center">
                <strong className="text-red-600">🚀 Votre position</strong>
                <br />
                <span className="text-sm text-gray-600">
                  📍 Vous êtes ici
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marqueur de la position actuelle (grisé en mode édition) */}
        {showCurrentLocation && currentLocation && isEditMode && (
          <Marker
            position={currentLocation}
            icon={currentUserIcon}
            opacity={0.5}
          >
            <Popup>
              <div className="text-center">
                <strong className="text-gray-600">📍 Position actuelle</strong>
                <br />
                <span className="text-sm text-gray-500">
                  Position enregistrée
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marqueur de la position temporaire en mode édition */}
        {isEditMode && tempLocation && (
          <Marker
            position={tempLocation}
            icon={tempLocationIcon}
          >
            <Popup>
              <div className="text-center">
                <strong className="text-orange-600">✏️ Nouvelle position</strong>
                <br />
                <span className="text-sm text-gray-600">
                  {hasUnsavedChanges ? '⚠️ Non sauvegardée' : '📍 Position temporaire'}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marqueurs des utilisateurs matchés */}
        {nearbyUsers?.map((user) => (
          <Marker
            key={user.id}
            position={[user.latitude, user.longitude]}
            icon={otherUserIcon}
            eventHandlers={{
              click: () => onUserClick?.(user)
            }}
          >
            <Popup>
              <div className="text-center max-w-xs">
                <div className="font-bold text-lg text-blue-700">👤 {user.first_name}</div>
                <div className="text-gray-600 text-sm">@{user.username}</div>
                <div className="text-gray-600 text-sm">🎂 {user.age} ans</div>
                <div className="text-blue-600 font-medium text-sm">
                  📍 À {formatDistance(user.distance)} de vous
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
      )}
    </div>
  );
}
