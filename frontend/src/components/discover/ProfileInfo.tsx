import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, ChevronDown, Star, Zap } from 'lucide-react';

interface ProfileInfoProps {
  name: string;
  age: number;
  location: string;
  distance: number;
  occupation: string;
  showDetails: boolean;
  onToggleDetails: () => void;
  candidate?: {
    id: number;
    algorithm_type: string;
    compatibility_score?: number;
    distance?: number;
  };
}

export function ProfileInfo({
  name,
  age,
  location,
  distance,
  occupation,
  showDetails,
  onToggleDetails,
  candidate
}: ProfileInfoProps) {
  return (
    <div className="p-6 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{name}, {age}</h2>
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg" />
          {candidate?.compatibility_score && (
            <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
              <Star className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                {(candidate.compatibility_score * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mb-1">
          <MapPin className="h-4 w-4" />
          <span>{location} • {candidate?.distance || distance}km</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-1">
          <Briefcase className="h-4 w-4" />
          <span>{occupation}</span>
        </div>
        {candidate?.algorithm_type && (
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Zap className="h-3 w-3" />
            <span>
              {candidate.algorithm_type === 'vector_based' ? 'Match intelligent' : 
               candidate.algorithm_type === 'proximity' ? 'À proximité' : 
               candidate.algorithm_type === 'random' ? 'Découverte' : 
               candidate.algorithm_type}
            </span>
          </div>
        )}
      </div>
      
      {/* Flèche pour voir plus */}
      <Button
        variant="outline"
        size="icon"
        className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600"
        onClick={onToggleDetails}
      >
        <ChevronDown className={`h-5 w-5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
      </Button>
    </div>
  );
}