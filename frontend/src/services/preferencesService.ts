import { apiService } from './api';
import type {
  UserMatchingPreferences,
  PreferencesResponse,
  UpdatePreferencesRequest,
  UpdatePreferencesResponse
} from '@/types/preferences';

// Re-export les types pour compatibilité
export type {
  UserMatchingPreferences,
  PreferencesResponse,
  UpdatePreferencesRequest,
  UpdatePreferencesResponse
} from '@/types/preferences';

class PreferencesService {
  private readonly baseEndpoint = '/api/v1/users';

  /**
   * Récupère les préférences de matching de l'utilisateur connecté
   */
  async getUserPreferences(userId: number): Promise<UserMatchingPreferences> {
    try {
      const response = await apiService.get<PreferencesResponse>(`${this.baseEndpoint}/${userId}/preferences`);
      return response.preferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  }

  /**
   * Met à jour les préférences de matching de l'utilisateur connecté
   */
  async updateUserPreferences(userId: number, preferences: UpdatePreferencesRequest): Promise<UserMatchingPreferences> {
    try {
      const response = await apiService.put<UpdatePreferencesResponse>(`${this.baseEndpoint}/${userId}/preferences`, preferences);
      return response.preferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Valide les préférences avant envoi
   */
  validatePreferences(preferences: UpdatePreferencesRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validation de l'âge
    if (preferences.age_min < 18 || preferences.age_min > 99) {
      errors.push('L\'âge minimum doit être entre 18 et 99 ans');
    }
    if (preferences.age_max < 18 || preferences.age_max > 99) {
      errors.push('L\'âge maximum doit être entre 18 et 99 ans');
    }
    if (preferences.age_min >= preferences.age_max) {
      errors.push('L\'âge minimum doit être inférieur à l\'âge maximum');
    }

    // Validation de la distance
    if (preferences.max_distance < 1 || preferences.max_distance > 10000) {
      errors.push('La distance maximale doit être entre 1 et 10000 km');
    }

    // Validation de la popularité
    if (preferences.min_fame < 0) {
      errors.push('La popularité minimale ne peut pas être négative');
    }

    // Validation des genres préférés
    if (!preferences.preferred_genders || preferences.preferred_genders.length === 0) {
      errors.push('Vous devez sélectionner au moins un genre préféré');
    }

    const validGenders = ['man', 'woman', 'other'];
    const invalidGenders = preferences.preferred_genders.filter(gender => !validGenders.includes(gender));
    if (invalidGenders.length > 0) {
      errors.push(`Genres invalides: ${invalidGenders.join(', ')}`);
    }

    // Validation des préférences lifestyle
    const validSmokingValues = ['any', 'smoker', 'non_smoker'];
    if (preferences.smoking_preference && !validSmokingValues.includes(preferences.smoking_preference)) {
      errors.push('Préférence tabac invalide');
    }

    const validAlcoholValues = ['any', 'drinker', 'non_drinker'];
    if (preferences.alcohol_preference && !validAlcoholValues.includes(preferences.alcohol_preference)) {
      errors.push('Préférence alcool invalide');
    }

    const validDrugsValues = ['any', 'user', 'non_user'];
    if (preferences.drugs_preference && !validDrugsValues.includes(preferences.drugs_preference)) {
      errors.push('Préférence drogues invalide');
    }

    const validCannabisValues = ['any', 'user', 'non_user'];
    if (preferences.cannabis_preference && !validCannabisValues.includes(preferences.cannabis_preference)) {
      errors.push('Préférence cannabis invalide');
    }

    // Validation des préférences religieuses
    const validReligionValues = ['any', 'same', 'different'];
    if (preferences.religion_preference && !validReligionValues.includes(preferences.religion_preference)) {
      errors.push('Préférence religieuse invalide');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Récupère les préférences par défaut pour un nouvel utilisateur
   */
  getDefaultPreferences(): UpdatePreferencesRequest {
    return {
      age_min: 18,
      age_max: 99,
      max_distance: 100, // Updated to 100km as per backend default
      min_fame: 0,
      preferred_genders: ['man', 'woman', 'other'],
      required_tags: [],
      blocked_tags: [],

      // Lifestyle defaults (no filtering)
      smoking_preference: 'any',
      alcohol_preference: 'any',
      drugs_preference: 'any',
      cannabis_preference: 'any',

      // Religious defaults (no filtering)
      religion_preference: 'any',
      blocked_religions: []
    };
  }
}

export const preferencesService = new PreferencesService();

// Export par défaut comme fallback
export default preferencesService;