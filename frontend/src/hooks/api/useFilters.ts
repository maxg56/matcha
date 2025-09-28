import { useFiltersStore } from '@/stores/filtersStore';

export function useFilters() {
  const {
    showFilters,
    setShowFilters,
  } = useFiltersStore();

  const handleOpenFilters = () => {
    setShowFilters(true);
  };

  const handleCloseFilters = () => {
    // Simplement fermer la modale - la logique de sauvegarde est gérée par MatchingPreferences
    setShowFilters(false);
  };

  return {
    showFilters,
    onOpenFilters: handleOpenFilters,
    onCloseFilters: handleCloseFilters,
    onFiltersChange: () => {}, // Fonction vide pour compatibilité
  };
}