import { useState } from 'react';

interface GeolocationCityResult {
	city: string | null;
	setCity: (city: string) => void;
	loading: boolean;
	error: string | null;
	getCityFromGeolocation: () => void;
}

export function useGeolocationCity(): GeolocationCityResult {
	const [city, setCity] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getCityFromGeolocation = () => {
		setLoading(true);
		setError(null);
		setCity(null);

    if (!navigator.geolocation) {
		setError("La géolocalisation n'est pas supportée par votre navigateur.");
		setLoading(false);
		return;
    }

    navigator.geolocation.getCurrentPosition(
  async (position) => {
    const { latitude, longitude } = position.coords;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            "User-Agent": "MyApp/1.0 (contact@myapp.com)", 
            "Accept-Language": "fr"
          }
        }
      );

      if (!response.ok) throw new Error("Erreur API Nominatim");
      const data = await response.json();

      const foundCity =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        "Ville inconnue";

      setCity(foundCity);
    } catch (err: any) {
      setError("Impossible de récupérer le nom de la ville : " + err.message);
    } finally {
      setLoading(false);
    }
  },
  (geoError) => {
    setError("Impossible de récupérer votre position : " + geoError.message);
    setLoading(false);
  }
);

	};

	return { city, setCity, loading, error, getCityFromGeolocation };
}
