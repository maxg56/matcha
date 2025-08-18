import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, ChevronDown } from 'lucide-react';

interface ProfileInfoProps {
  name: string;
  age: number;
  location: string;
  distance: number;
  occupation: string;
  showDetails: boolean;
  onToggleDetails: () => void;
}

export function ProfileInfo({
  name,
  age,
  location,
  distance,
  occupation,
  showDetails,
  onToggleDetails
}: ProfileInfoProps) {
  return (
    <div className="p-6 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{name}, {age}</h2>
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg" />
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mb-1">
          <MapPin className="h-4 w-4" />
          <span>{location} • {distance}km</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Briefcase className="h-4 w-4" />
          <span>{occupation}</span>
        </div>
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