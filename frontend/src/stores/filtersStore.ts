import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { FilterState } from '@/types/filters';

interface FiltersState {
  filters: FilterState;
  showFilters: boolean;
  hasChanges: boolean;
  savedFilters: FilterState;
}

interface FiltersActions {
  updateFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  discardChanges: () => void;
  setShowFilters: (show: boolean) => void;
  updateAgeRange: (range: [number, number]) => void;
  updateDistance: (distance: number) => void;
  updateHeightRange: (range: [number, number]) => void;
  updateShowMe: (showMe: 'woman' | 'man' | 'both') => void;
  toggleTag: (tag: string) => void;
  toggleArrayFilter: (filterKey: keyof FilterState, value: string) => void;
  clearArrayFilter: (filterKey: keyof FilterState) => void;
}

type FiltersStore = FiltersState & FiltersActions;

const defaultFilters: FilterState = {
  ageRange: [18, 35],
  distance: 50,
  heightRange: [150, 200],
  showMe: 'both',
  hairColors: [],
  eyeColors: [],
  skinColors: [],
  alcoholConsumption: [],
  smoking: [],
  cannabis: [],
  drugs: [],
  pets: [],
  socialActivityLevel: [],
  sportActivity: [],
  educationLevel: [],
  religion: [],
  relationshipType: [],
  childrenStatus: [],
  politicalView: [],
  birthCity: '',
  currentCity: '',
  tags: [],
};

export const useFiltersStore = create<FiltersStore>()(
  devtools(
    persist(
      (set, get) => ({
        filters: { ...defaultFilters },
        showFilters: false,
        hasChanges: false,
        savedFilters: { ...defaultFilters },

        setShowFilters: (showFilters) => set({ showFilters }),

        updateFilters: (newFilters: Partial<FilterState>) => {
          const currentFilters = get().filters;
          const updatedFilters = { ...currentFilters, ...newFilters };
          const savedFilters = get().savedFilters;
          
          set({
            filters: updatedFilters,
            hasChanges: JSON.stringify(updatedFilters) !== JSON.stringify(savedFilters),
          });
        },

        updateAgeRange: (ageRange: [number, number]) => {
          get().updateFilters({ ageRange });
        },

        updateDistance: (distance: number) => {
          get().updateFilters({ distance });
        },

        updateHeightRange: (heightRange: [number, number]) => {
          get().updateFilters({ heightRange });
        },

        updateShowMe: (showMe: 'woman' | 'man' | 'both') => {
          get().updateFilters({ showMe });
        },

        toggleTag: (tag: string) => {
          const currentTags = get().filters.tags;
          const updatedTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];
          
          get().updateFilters({ tags: updatedTags });
        },

        toggleArrayFilter: (filterKey: keyof FilterState, value: string) => {
          const currentFilters = get().filters;
          const currentArray = currentFilters[filterKey] as string[];
          
          if (Array.isArray(currentArray)) {
            const updatedArray = currentArray.includes(value)
              ? currentArray.filter(item => item !== value)
              : [...currentArray, value];
            
            get().updateFilters({ [filterKey]: updatedArray } as Partial<FilterState>);
          }
        },

        clearArrayFilter: (filterKey: keyof FilterState) => {
          get().updateFilters({ [filterKey]: [] } as Partial<FilterState>);
        },

        applyFilters: () => {
          const currentFilters = get().filters;
          set({
            savedFilters: { ...currentFilters },
            hasChanges: false,
            showFilters: false,
          });
          
          // Here you could also trigger a callback or event to refetch profiles
          // based on the new filters
        },

        discardChanges: () => {
          const savedFilters = get().savedFilters;
          set({
            filters: { ...savedFilters },
            hasChanges: false,
            showFilters: false,
          });
        },

        resetFilters: () => {
          set({
            filters: { ...defaultFilters },
            savedFilters: { ...defaultFilters },
            hasChanges: false,
            showFilters: false,
          });
        },
      }),
      {
        name: 'filters-store',
        partialize: (state) => ({ 
          savedFilters: state.savedFilters,
          filters: state.filters 
        }),
      }
    ),
    { name: 'FiltersStore' }
  )
);

export { defaultFilters };
export type { FilterState };