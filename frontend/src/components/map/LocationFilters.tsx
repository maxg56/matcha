import { useState, useEffect } from "react";
import { locationService, type SearchFilters } from "@/services/locationService";
import { useToast } from "@/hooks/ui/useToast";

interface LocationFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  className?: string;
}

export function LocationFilters({
  onFiltersChange,
  initialFilters = {},
  className = ""
}: LocationFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    max_distance: 200,
    age_min: 18,
    age_max: 50,
    limit: 50,
    ...initialFilters
  });

  const [cityInput, setCityInput] = useState(initialFilters.city || "");
  const [isSearching, setIsSearching] = useState(false);
  const { warning, info, error: showError, success } = useToast();

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleDistanceChange = (value: number) => {
    setFilters(prev => ({ ...prev, max_distance: value }));
  };

  const handleAgeRangeChange = (type: 'min' | 'max', value: number) => {
    setFilters(prev => ({ ...prev, [`age_${type}`]: value }));
  };

  const handleCitySearch = async () => {
    if (!cityInput.trim()) {
      setFilters(prev => ({ ...prev, city: undefined }));
      return;
    }

    setIsSearching(true);
    try {
      // Ici vous pourriez implémenter une recherche de ville avec géocodage
      // Pour l'instant, on met simplement la ville dans les filtres
      setFilters(prev => ({ ...prev, city: cityInput.trim() }));
    } catch (error) {
      console.error('Erreur lors de la recherche de ville:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    const defaultFilters: SearchFilters = {
      max_distance: 200,
      age_min: 18,
      age_max: 50,
      limit: 50
    };
    setFilters(defaultFilters);
    setCityInput("");
  };

  const handleCurrentLocation = async () => {
    try {
      setIsSearching(true);
      const position = await locationService.getBrowserLocation();
      setFilters(prev => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        city: undefined // Reset city when using coordinates
      }));
      setCityInput("");
      success('Position géographique mise à jour avec succès !', {
        title: 'Localisation mise à jour'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la position:', error);

      // Afficher un message d'erreur plus convivial à l'utilisateur
      if (error instanceof Error) {
        if (error.message.includes('refusé')) {
          // L'utilisateur peut continuer sans géolocalisation
          warning('Géolocalisation refusée. Vous pouvez toujours rechercher par ville.', {
            title: 'Localisation refusée',
            duration: 6000
          });
        } else if (error.message.includes('non disponibles')) {
          info('Géolocalisation non disponible sur ce navigateur. Utilisez la recherche par ville.', {
            title: 'Localisation indisponible'
          });
        } else if (error.message.includes('Timeout')) {
          warning('Délai dépassé pour obtenir votre position. Réessayez ou utilisez la recherche par ville.', {
            title: 'Timeout'
          });
        } else if (error.message.includes('trop récente')) {
          info('Attendez quelques secondes avant de réessayer la géolocalisation.', {
            title: 'Trop de tentatives'
          });
        } else {
          showError('Impossible d\'obtenir votre position. Utilisez la recherche par ville.', {
            title: 'Erreur de géolocalisation'
          });
        }
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Filtres de recherche
      </h3>

      {/* Distance maximale */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Distance maximale: {filters.max_distance} km
        </label>
        <input
          type="range"
          min="5"
          max="200"
          step="5"
          value={filters.max_distance || 200}
          onChange={(e) => handleDistanceChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>5 km</span>
          <span>200 km</span>
        </div>
      </div>

      {/* Tranche d'âge */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tranche d'âge: {filters.age_min} - {filters.age_max} ans
        </label>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Âge minimum: {filters.age_min}
            </label>
            <input
              type="range"
              min="18"
              max="80"
              value={filters.age_min || 18}
              onChange={(e) => handleAgeRangeChange('min', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Âge maximum: {filters.age_max}
            </label>
            <input
              type="range"
              min="18"
              max="80"
              value={filters.age_max || 50}
              onChange={(e) => handleAgeRangeChange('max', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Recherche par ville */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Ville
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Ex: Paris, Lyon, Marseille..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCitySearch();
              }
            }}
          />
          <button
            onClick={handleCitySearch}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-md transition-colors font-medium"
          >
            {isSearching ? '...' : '🔍'}
          </button>
        </div>
        {filters.city && (
          <p className="text-sm text-green-600 dark:text-green-400">
            📍 Recherche dans: {filters.city}
          </p>
        )}
      </div>

      {/* Position actuelle */}
      <div className="space-y-2">
        <button
          onClick={handleCurrentLocation}
          disabled={isSearching}
          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-md transition-colors font-medium"
        >
          {isSearching ? 'Localisation...' : '📍 Utiliser ma position actuelle'}
        </button>
        {filters.latitude && filters.longitude && (
          <p className="text-sm text-green-600 dark:text-green-400">
            Position: {filters.latitude.toFixed(4)}, {filters.longitude.toFixed(4)}
          </p>
        )}
      </div>

      {/* Nombre de résultats */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre de résultats maximum
        </label>
        <select
          value={filters.limit || 50}
          onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value) }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Boutons d'action */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors font-medium"
        >
          Réinitialiser
        </button>
      </div>

      {/* Résumé des filtres actifs */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p><strong>Filtres actifs:</strong></p>
        <ul className="space-y-1 ml-2">
          <li>• Distance: max {filters.max_distance} km</li>
          <li>• Âge: {filters.age_min}-{filters.age_max} ans</li>
          <li>• Résultats: max {filters.limit}</li>
          {filters.city && <li>• Ville: {filters.city}</li>}
          {filters.latitude && <li>• Position géographique définie</li>}
        </ul>
      </div>
    </div>
  );
}