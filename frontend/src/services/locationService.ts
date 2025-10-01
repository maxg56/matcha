import { apiService } from './api';

export interface UserLocation {
  id: number;
  user_id: number;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  updated_at: string;
}

export interface NearbyUser {
  id: number;
  username: string;
  first_name: string;
  age: number;
  bio: string;
  images?: string[];
  tags?: string[];
  current_city?: string;
  latitude: number;
  longitude: number;
  distance: number; // en kilomètres
  compatibility_score?: number;
}

export interface NearbyUsersResponse {
  users: NearbyUser[];
  count: number;
  center_location: {
    latitude: number;
    longitude: number;
  };
  search_radius: number;
}

export interface SearchFilters {
  city?: string;
  max_distance?: number; // en kilomètres
  age_min?: number;
  age_max?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
}

export interface SearchResponse {
  users: NearbyUser[];
  count: number;
  filters_applied: SearchFilters;
}

export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface LocationUpdateResponse {
  success: boolean;
  location: UserLocation;
  message?: string;
}

export interface GeolocationError extends Error {
  code: number;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
}

class LocationService {
  private readonly baseEndpoint = '/api/v1/location';
  private geolocationPromise: Promise<GeolocationPosition> | null = null;
  private lastGeolocationAttempt: number = 0;

  /**
   * Récupère les utilisateurs matchés avec leur localisation
   */
  async getMatchedUsers(): Promise<NearbyUsersResponse> {
    return apiService.get<NearbyUsersResponse>(
      `${this.baseEndpoint}/nearby`
    );
  }

  /**
   * Récupère les utilisateurs à proximité (ancien endpoint, garde pour compatibilité)
   */
  async getNearbyUsers(radius: number = 200, limit: number = 50): Promise<NearbyUsersResponse> {
    const queryParams = new URLSearchParams({
      radius: radius.toString(),
      limit: limit.toString()
    });

    return apiService.get<NearbyUsersResponse>(
      `${this.baseEndpoint}/nearby?${queryParams.toString()}`
    );
  }

  /**
   * Recherche des utilisateurs par critères géographiques et démographiques
   */
  async searchUsers(filters: SearchFilters): Promise<SearchResponse> {
    const queryParams = new URLSearchParams();

    if (filters.city) queryParams.append('city', filters.city);
    if (filters.max_distance) queryParams.append('max_distance', filters.max_distance.toString());
    if (filters.age_min) queryParams.append('age_min', filters.age_min.toString());
    if (filters.age_max) queryParams.append('age_max', filters.age_max.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.latitude) queryParams.append('latitude', filters.latitude.toString());
    if (filters.longitude) queryParams.append('longitude', filters.longitude.toString());

    return apiService.get<SearchResponse>(
      `${this.baseEndpoint}/search?${queryParams.toString()}`
    );
  }

  /**
   * Met à jour la localisation de l'utilisateur
   */
  async updateLocation(locationData: LocationUpdateRequest): Promise<LocationUpdateResponse> {
    return apiService.put<LocationUpdateResponse>(
      `${this.baseEndpoint}/location`,
      locationData
    );
  }

  /**
   * Récupère la localisation actuelle de l'utilisateur
   */
  async getCurrentLocation(): Promise<UserLocation> {
    return apiService.get<UserLocation>(`${this.baseEndpoint}/location`);
  }

  /**
   * Obtient la position géographique du navigateur avec protection contre les appels multiples
   */
  async getBrowserLocation(): Promise<GeolocationPosition> {
    const now = Date.now();

    // Si une requête est déjà en cours, on retourne la même promesse
    if (this.geolocationPromise) {
      return this.geolocationPromise;
    }

    // Éviter les tentatives répétées trop rapprochées (moins de 2 secondes)
    if (now - this.lastGeolocationAttempt < 2000) {
      throw new Error('Tentative de géolocalisation trop récente. Attendez quelques secondes.');
    }

    this.lastGeolocationAttempt = now;

    this.geolocationPromise = new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La géolocalisation n\'est pas supportée par ce navigateur'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.geolocationPromise = null; // Reset après succès
          resolve(position);
        },
        (error) => {
          this.geolocationPromise = null; // Reset après erreur
          let message: string;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Accès à la localisation refusé par l\'utilisateur';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Informations de localisation non disponibles';
              break;
            case error.TIMEOUT:
              message = 'Timeout lors de la demande de localisation';
              break;
            default:
              message = 'Erreur inconnue lors de la récupération de la localisation';
              break;
          }
          reject(new Error(message));
        },
        options
      );
    });

    return this.geolocationPromise;
  }

  /**
   * Met à jour la localisation avec les coordonnées du navigateur
   */
  async updateLocationFromBrowser(): Promise<LocationUpdateResponse> {
    try {
      const position = await this.getBrowserLocation();

      const locationData: LocationUpdateRequest = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      // Tentative de géocodage inverse pour obtenir la ville
      try {
        const geocodeResult = await this.reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        );
        if (geocodeResult.city) {
          locationData.city = geocodeResult.city;
        }
        if (geocodeResult.country) {
          locationData.country = geocodeResult.country;
        }
      } catch (geocodeError) {
        console.warn('Géocodage inverse échoué:', geocodeError);
        // Continue sans les informations de ville/pays
      }

      return await this.updateLocation(locationData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la localisation:', error);
      throw error;
    }
  }

  /**
   * Géocodage inverse pour obtenir l'adresse à partir des coordonnées
   * Utilise le service backend qui fait l'appel à l'API de géocodage
   */
  private async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{ city?: string; country?: string }> {
    try {
      // Utiliser le service backend pour le géocodage inverse
      const result = await apiService.get<{ city?: string; country?: string }>(
        `/api/v1/location/reverse-geocode?lat=${latitude}&lon=${longitude}`
      );
      return result;
    } catch (error) {
      console.warn('Backend geocoding failed, fallback to direct API call:', error);

      // Fallback vers l'API directe en cas d'échec du backend
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'Matcha-App/1.0'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Échec du géocodage inverse');
        }

        const data = await response.json();

        return {
          city: data.address?.city || data.address?.town || data.address?.village,
          country: data.address?.country
        };
      } catch (fallbackError) {
        console.error('Erreur lors du géocodage inverse (fallback):', fallbackError);
        return {};
      }
    }
  }

  /**
   * Calcule la distance entre deux points géographiques (formule de Haversine)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en kilomètres
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Valide les coordonnées géographiques
   */
  isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    );
  }
}

export const locationService = new LocationService();