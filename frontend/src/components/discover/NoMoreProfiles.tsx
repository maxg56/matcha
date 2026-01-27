import { Button } from '@/components/ui/button';
import { Star, Sliders, RotateCcw, Plus } from 'lucide-react';

interface NoMoreProfilesProps {
  onOpenFilters: () => void;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasMoreCandidates?: boolean;
  isLoadingMore?: boolean;
  totalCandidates?: number;
}

export function NoMoreProfiles({
  onOpenFilters,
  onRefresh,
  onLoadMore,
  hasMoreCandidates = false,
  isLoadingMore = false,
  totalCandidates = 0
}: NoMoreProfilesProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="h-10 w-10 text-gray-400" />
        </div>

        {hasMoreCandidates ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Fin de cette série
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Vous avez vu {totalCandidates} profils. Il y en a encore plus à découvrir !
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              Chargez plus de profils ou ajustez vos filtres pour de nouvelles découvertes.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Plus de profils à découvrir
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {totalCandidates > 0
                ? `Vous avez vu tous les ${totalCandidates} profils disponibles.`
                : 'Aucun profil trouvé avec ces critères.'
              }
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              Essayez d'ajuster vos filtres ou de recharger pour voir de nouveaux profils.
            </p>
          </>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          {hasMoreCandidates && onLoadMore && (
            <Button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isLoadingMore ? 'Chargement...' : 'Charger plus'}
            </Button>
          )}

          {onRefresh && (
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isLoadingMore}
              className="shadow-lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Recharger
            </Button>
          )}

          <Button
            className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-lg"
            onClick={onOpenFilters}
          >
            <Sliders className="h-5 w-5 mr-2" />
            Ajuster les filtres
          </Button>
        </div>
      </div>
    </div>
  );
}