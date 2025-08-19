import { useState } from 'react';
import type { FilterState } from '@/types/filters';

export function useFilters() {
  const [showFilters, setShowFilters] = useState(false);

  const handleFiltersChange = (filters: FilterState) => {
    console.log('Filters applied:', filters);
    setShowFilters(false);
  };

  const handleOpenFilters = () => {
    setShowFilters(true);
  };

  const handleCloseFilters = () => {
    setShowFilters(false);
  };

  return {
    showFilters,
    onOpenFilters: handleOpenFilters,
    onCloseFilters: handleCloseFilters,
    onFiltersChange: handleFiltersChange,
  };
}