import { useState, useEffect, useCallback } from 'react';
import { preferencesService } from '@/services/preferencesService';
import type { UserMatchingPreferences, UpdatePreferencesRequest } from '@/types/preferences';
import { useAuth } from '@/hooks';
import { useToast } from '@/hooks/ui/useToast';

interface UsePreferencesResult {
  preferences: UserMatchingPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (newPreferences: UpdatePreferencesRequest) => Promise<boolean>;
  resetPreferences: () => void;
  refetchPreferences: () => Promise<void>;
}

export function usePreferences(): UsePreferencesResult {
  const { user } = useAuth();
  const { error: showErrorToast, success: showSuccessToast } = useToast();
  const [preferences, setPreferences] = useState<UserMatchingPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les préférences
  const fetchPreferences = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const userPreferences = await preferencesService.getUserPreferences(user.id);
      setPreferences(userPreferences);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des préférences';
      setError(errorMessage);
      console.error('Error fetching preferences:', err);

      // Toast d'erreur pour l'utilisateur
      showErrorToast('Impossible de charger vos préférences');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fonction pour mettre à jour les préférences
  const updatePreferences = useCallback(async (newPreferences: UpdatePreferencesRequest): Promise<boolean> => {
    if (!user?.id) {
      showErrorToast('Utilisateur non connecté');
      return false;
    }

    // Validation côté client
    const validation = preferencesService.validatePreferences(newPreferences);
    if (!validation.valid) {
      showErrorToast(`Préférences invalides: ${validation.errors[0]}`);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedPreferences = await preferencesService.updateUserPreferences(user.id, newPreferences);
      setPreferences(updatedPreferences);

      // Toast de succès
      showSuccessToast('Préférences mises à jour avec succès');

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      console.error('Error updating preferences:', err);

      // Toast d'erreur
      showErrorToast(`Échec de la mise à jour: ${errorMessage}`);

      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fonction pour réinitialiser aux préférences par défaut
  const resetPreferences = useCallback(() => {
    if (!user?.id) return;

    const defaultPrefs = preferencesService.getDefaultPreferences(user.id);
    updatePreferences(defaultPrefs);
  }, [user?.id, updatePreferences]);

  // Fonction pour refetch manuellement
  const refetchPreferences = useCallback(async () => {
    await fetchPreferences();
  }, [fetchPreferences]);

  // Charger les préférences au montage du composant
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    resetPreferences,
    refetchPreferences
  };
}