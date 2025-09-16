import { useEffect, useState } from 'react';
import { History, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useProfileAnalytics } from '@/hooks/api/useProfileAnalytics';

interface ViewedProfilesListProps {
  className?: string;
}

export function ViewedProfilesList({ className }: ViewedProfilesListProps) {
  const {
    myViews,
    isLoading,
    error,
    getMyProfileViews,
  } = useProfileAnalytics();

  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      try {
        const response = await getMyProfileViews(20, 0);
        setHasMore(response.viewed_profiles.length === 20);
      } catch (err) {
        console.error('Failed to load viewed profiles:', err);
      }
    };

    loadData();
  }, [getMyProfileViews]);

  const loadMore = async () => {
    try {
      const response = await getMyProfileViews(20, myViews?.length || 0);
      setHasMore(response.viewed_profiles.length === 20);
    } catch (err) {
      console.error('Failed to load more viewed profiles:', err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Il y a moins d\'une heure';
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400">
          <p>Erreur lors du chargement de l'historique des profils</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Profils que vous avez vus</h3>
          </div>
        </div>

        {/* Viewed Profiles List */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Historique de vos visites
          </h4>

          {isLoading && (!myViews || myViews.length === 0) ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/3 mb-1" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : !myViews || myViews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun profil visité récemment</p>
              <p className="text-sm mt-1">
                Commencez à découvrir des profils pour voir votre historique ici
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {myViews.map((view) => (
                <div
                  key={`${view.profile.id}-${view.viewed_at}`}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs">
                        {view.profile.first_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {view.profile.first_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {view.profile.age} ans • ⭐ {view.profile.fame}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(view.viewed_at)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <Button
                  variant="ghost"
                  onClick={loadMore}
                  className="w-full mt-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Chargement...' : 'Voir plus'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}