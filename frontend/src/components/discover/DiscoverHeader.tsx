import { Button } from '@/components/ui/button';
import { Heart, Sliders, MoreHorizontal } from 'lucide-react';

interface DiscoverHeaderProps {
  onOpenFilters: () => void;
  onMoreOptions?: () => void;
}

export function DiscoverHeader({ onOpenFilters, onMoreOptions }: DiscoverHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="h-5 w-5 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Matcha</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Découvrez l'amour</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600"
            onClick={onOpenFilters}
          >
            <Sliders className="h-4 w-4" />
            Filtres
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={onMoreOptions}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
