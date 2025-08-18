import { Button } from '@/components/ui/button';
import { Star, Sliders } from 'lucide-react';

interface NoMoreProfilesProps {
  onOpenFilters: () => void;
}

export function NoMoreProfiles({ onOpenFilters }: NoMoreProfilesProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Plus de profils à découvrir
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Revenez plus tard pour voir de nouveaux profils
        </p>

        <Button
          className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-lg"
          onClick={onOpenFilters}
        >
          <Sliders className="h-5 w-5 mr-2" />
          Ajuster les filtres
        </Button>
      </div>
    </div>
  );
}
