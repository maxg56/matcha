import { useMemo } from 'react';
import { type UserProfile } from '@/services/matchService';
import { type UserMatchingPreferences } from '@/types/preferences';

export interface MatchingFilterOptions {
  preferences?: UserMatchingPreferences | null;
  userLocation?: { latitude: number; longitude: number };
}

interface FilteredResult {
  user: UserProfile;
  distance?: number;
  compatibilityScore: number;
}

/**
 * Calcule la distance entre deux points géographiques (formule haversine)
 */
function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calcule un score de compatibilité basé sur les préférences
 */
function calculateCompatibilityScore(
  user: UserProfile,
  preferences: UserMatchingPreferences
): number {
  let score = 0;
  let factors = 0;

  // Score basé sur l'âge (50% de compatibilité si dans la tranche, 0% sinon)
  if (user.age >= preferences.age_min && user.age <= preferences.age_max) {
    score += 50;
  }
  factors += 50;

  // Score basé sur la popularité (0-25% selon la proximité avec min_fame)
  const fameScore = Math.max(0, Math.min(25, (user.fame - preferences.min_fame) / 10));
  score += fameScore;
  factors += 25;

  // Score basé sur les tags requis (25% de bonus total)
  if (preferences.required_tags.length > 0 && user.tags) {
    const matchingRequiredTags = preferences.required_tags.filter(tag =>
      user.tags?.includes(tag)
    );
    const requiredTagScore = (matchingRequiredTags.length / preferences.required_tags.length) * 25;
    score += requiredTagScore;
  }
  factors += 25;

  return Math.round((score / factors) * 100);
}

/**
 * Hook pour filtrer et trier les profils selon les préférences
 */
export function useMatchingFilter(
  users: UserProfile[],
  options: MatchingFilterOptions = {}
): FilteredResult[] {
  const { preferences, userLocation } = options;

  return useMemo(() => {
    if (!preferences) {
      // Sans préférences, retourner tous les utilisateurs avec un score de base
      return users.map(user => ({
        user,
        compatibilityScore: 50 // Score neutre
      }));
    }

    const filtered = users
      .map((user): FilteredResult | null => {
        // Filtrer par genre préféré
        if (!preferences.preferred_genders.includes(user.gender)) {
          return null;
        }

        // Filtrer par âge
        if (user.age < preferences.age_min || user.age > preferences.age_max) {
          return null;
        }

        // Filtrer par popularité minimale
        if (user.fame < preferences.min_fame) {
          return null;
        }

        // Filtrer par tags bloqués
        if (preferences.blocked_tags.length > 0 && user.tags) {
          const hasBlockedTags = preferences.blocked_tags.some(tag =>
            user.tags?.includes(tag)
          );
          if (hasBlockedTags) {
            return null;
          }
        }

        // Calculer la distance si les coordonnées sont disponibles
        let distance: number | undefined;
        if (userLocation && user.latitude != null && user.longitude != null) {
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            user.latitude,
            user.longitude
          );

          // Filtrer par distance maximale
          if (distance > preferences.max_distance) {
            return null;
          }
        }

        // Calculer le score de compatibilité
        const compatibilityScore = calculateCompatibilityScore(user, preferences);

        return {
          user,
          distance,
          compatibilityScore
        };
      })
      .filter((result): result is FilteredResult => result !== null)
      .sort((a, b) => {
        // Trier par score de compatibilité (décroissant), puis par distance (croissant)
        if (a.compatibilityScore !== b.compatibilityScore) {
          return b.compatibilityScore - a.compatibilityScore;
        }

        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }

        return 0;
      });

    return filtered;
  }, [users, preferences, userLocation]);
}

/**
 * Hook pour obtenir des statistiques sur le filtrage
 */
export function useFilterStats(
  originalCount: number,
  filteredCount: number,
  preferences?: UserMatchingPreferences | null
) {
  return useMemo(() => {
    const filterRate = originalCount > 0 ? (filteredCount / originalCount) * 100 : 0;

    const activeFilters = [];
    if (preferences) {
      if (preferences.age_min > 18 || preferences.age_max < 99) {
        activeFilters.push(`Âge: ${preferences.age_min}-${preferences.age_max} ans`);
      }
      if (preferences.max_distance < 200) {
        activeFilters.push(`Distance: ${preferences.max_distance} km`);
      }
      if (preferences.min_fame > 0) {
        activeFilters.push(`Popularité: ${preferences.min_fame}+`);
      }
      if (preferences.preferred_genders.length < 3) {
        activeFilters.push(`Genres: ${preferences.preferred_genders.join(', ')}`);
      }
      if (preferences.required_tags.length > 0) {
        activeFilters.push(`Tags requis: ${preferences.required_tags.length}`);
      }
      if (preferences.blocked_tags.length > 0) {
        activeFilters.push(`Tags bloqués: ${preferences.blocked_tags.length}`);
      }
    }

    return {
      originalCount,
      filteredCount,
      filterRate: Math.round(filterRate),
      activeFilters,
      isFiltered: activeFilters.length > 0
    };
  }, [originalCount, filteredCount, preferences]);
}