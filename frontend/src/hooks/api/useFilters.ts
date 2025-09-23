import { useFiltersStore } from '@/stores/filtersStore';
import type { FilterState } from '@/types/filters';

export function useFilters() {
  const {
    showFilters,
    setShowFilters,
    applyFilters,
    discardChanges,
  } = useFiltersStore();

  const handleFiltersChange = (_filters: FilterState) => {
    applyFilters();
  };

  const handleOpenFilters = () => {
    setShowFilters(true);
  };

  const handleCloseFilters = () => {
    discardChanges();
  };

  return {
    showFilters,
    onOpenFilters: handleOpenFilters,
    onCloseFilters: handleCloseFilters,
    onFiltersChange: handleFiltersChange,
  };
}