import { Slider } from '@/components/ui/slider';
import { useGeolocationCity } from '@/hooks/useGeolocationCity';
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
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex flex-col gap-1">
        {texts.map((text, idx) => (
          <span key={idx}>{text}</span>
        ))}
        <input
          type="text"
          placeholder="Entrez votre ville"
          className="border border-gray-300 rounded-md p-2"
          value={currentCity}
          onChange={(e) => onCityChange(e.target.value)}
        />
        <button
          type="button"
          className="px-2 py-1 rounded bg-blue-500 text-white text-xs mt-1 w-fit hover:bg-blue-600 transition"
          onClick={geolocationCity.getCityFromGeolocation}
          disabled={geolocationCity.loading}
        >
          {geolocationCity.loading ? 'Recherche...' : 'Détecter ma ville'}
        </button>
      </div>
    </div>
  );
}