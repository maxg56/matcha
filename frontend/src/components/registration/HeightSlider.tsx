import { Slider } from '@/components/ui/slider';
import { useGeolocationCity } from '@/hooks/useGeolocationCity';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

interface HeightSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  currentCity: string;
  onCityChange: (city: string) => void;
  error?: string;
  helpText?: string;
}

export function HeightSlider({
  label,
  value,
  onChange,
  min = 100,
  max = 240,
  step = 1,
  className,
  currentCity,
  onCityChange,
  error,
  helpText,
}: HeightSliderProps) {
  const geolocationCity = useGeolocationCity();

  // Synchronisation de la ville  par la géoloc avec le store
  useEffect(() => {
    if (geolocationCity.city && geolocationCity.city !== currentCity) {
      onCityChange(geolocationCity.city);
    }
  }, [geolocationCity.city, currentCity, onCityChange]);

  const texts: string[] = [];
  if (geolocationCity.error) {
    texts.push(`Erreur : ${geolocationCity.error}`);
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {label}: {value} cm
      </label>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(newValue) => onChange(newValue[0])}
        className="mb-4"
      />
      {/* Section Ville */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ville actuelle
        </label>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Entrez votre ville"
            className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
              error
                ? "border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-transparent"
            }`}
            value={currentCity}
            onChange={(e) => onCityChange(e.target.value)}
          />

          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm hover:bg-purple-600 transition disabled:opacity-50"
            onClick={geolocationCity.getCityFromGeolocation}
            disabled={geolocationCity.loading}
          >
            {geolocationCity.loading ? (
              <>
                <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Recherche...
              </>
            ) : (
              '📍 Détecter ma ville'
            )}
          </button>
        </div>

        {/* Messages d'erreur de géolocalisation */}
        {texts.length > 0 && (
          <div className="mt-2 space-y-1">
            {texts.map((text, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-4 w-4" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message d'aide */}
      {helpText && !error && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-600 dark:text-blue-400">{helpText}</p>
        </div>
      )}
    </div>
  );
}