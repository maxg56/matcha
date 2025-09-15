import { useEffect, useState } from 'react';
import { Eye, TrendingUp, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useProfileAnalytics } from '@/hooks/api/useProfileAnalytics';

interface ProfileViewersProps {
  className?: string;
}

export function ProfileViewers({ className }: ProfileViewersProps) {
  const {
    viewers,
    viewStats,
    isLoading,
    error,
    getProfileViewers,
    getProfileViewStats,
  } = useProfileAnalytics();

  const [showAll, setShowAll] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      try {
        await Promise.all([
          getProfileViewStats(),
          getProfileViewers(6, 0) // Initial load with 6 viewers
        ]);
      } catch (err) {
        console.error('Failed to load profile analytics:', err);
      }
    };

    loadData();
  }, [getProfileViewers, getProfileViewStats]);

  const loadMoreViewers = async () => {
    try {
      const response = await getProfileViewers(20, viewers.length);
      setHasMore(response.viewers.length === 20);
    } catch (err) {
      console.error('Failed to load more viewers:', err);
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
          <p>Erreur lors du chargement des statistiques de profil</p>
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
            <Eye className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Vues de profil</h3>
          </div>
          {viewStats && (
            <Badge variant="secondary" className="text-sm">
              {viewStats.total_views} vues
            </Badge>
          )}
        </div>

        {/* Statistics */}
        {viewStats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div className="text-sm">
                <p className="font-medium">{viewStats.weekly_views}</p>
                <p className="text-muted-foreground">Cette semaine</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium">{viewStats.unique_viewers}</p>
                <p className="text-muted-foreground">Visiteurs uniques</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Viewers */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Qui a vu votre profil récemment
          </h4>

          {isLoading && viewers.length === 0 ? (
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
          ) : viewers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune vue de profil récente</p>
              <p className="text-sm mt-1">
                Votre profil n'a pas encore été visité
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {(showAll ? viewers : viewers.slice(0, 6)).map((view) => (
                <div
                  key={`${view.viewer.id}-${view.viewed_at}`}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs">
                        {view.viewer.first_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {view.viewer.first_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {view.viewer.age} ans • ⭐ {view.viewer.fame}
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

              {/* Show More/Less Button */}
              {viewers.length > 6 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (!showAll && !hasMore) {
                      loadMoreViewers();
                    }
                    setShowAll(!showAll);
                  }}
                  className="w-full mt-3"
                  disabled={isLoading}
                >
                  {showAll ? 'Voir moins' : `Voir plus (${viewers.length} total)`}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}