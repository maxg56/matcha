import { useState } from 'react';
import { MapPin, X, Settings } from 'lucide-react';
import { locationService } from '@/services/locationService';

interface LocationPromptProps {
  onDismiss: () => void;
  onLocationSet?: () => void;
}

export function LocationPrompt({ onDismiss, onLocationSet }: LocationPromptProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivateLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await locationService.updateLocationFromBrowser();
      onLocationSet?.();
      onDismiss();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'activation de la géolocalisation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mx-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Activez votre géolocalisation
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Pour voir des matches près de chez vous et calculer les distances, nous avons besoin de votre position géographique.
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3">
                <p className="text-sm text-red-600">{error}</p>
                <p className="text-xs text-red-500 mt-1">
                  Vérifiez que vous avez autorisé l'accès à votre localisation dans votre navigateur.
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleActivateLocation}
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <MapPin className="h-4 w-4" />
                <span>{loading ? 'Activation...' : 'Activer maintenant'}</span>
              </button>
              
              <button
                onClick={() => window.location.hash = '#/settings'}
                className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Aller aux paramètres</span>
              </button>
            </div>
            
            <div className="mt-3 bg-blue-50 rounded-md p-2">
              <p className="text-xs text-blue-600 font-medium">💡 Avantages de la géolocalisation :</p>
              <ul className="text-xs text-blue-500 mt-1 space-y-1">
                <li>• Découvrez des personnes près de chez vous</li>
                <li>• Voyez les distances sur la carte interactive</li>
                <li>• Améliorez la pertinence de vos recommendations</li>
              </ul>
            </div>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-blue-100 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-blue-500" />
        </button>
      </div>
    </div>
  );
}
