import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Heart,
  Activity,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  BarChart3,
  TrendingDown,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { adminService, type AdminStatsResponse, type MatchTrendsResponse } from '@/services/admin';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [adminStats, setAdminStats] = useState<AdminStatsResponse | null>(null);
  const [matchTrends, setMatchTrends] = useState<MatchTrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendPeriod, setTrendPeriod] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Liste des utilisateurs admin autorisés
  const adminUsers = ['admin', 'administrator', 'root'];

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/admin/login');
      return;
    }

    const isAdmin = adminUsers.includes(user.username?.toLowerCase() || '') || user.id === 1;

    if (!isAdmin) {
      setError('Accès non autorisé. Cette page est réservée aux administrateurs.');
      setLoading(false);
      return;
    }

    loadData();
  }, [isAuthenticated, user, navigate]);

  const loadData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setIsRefreshing(true);
      setLoading(true);
      setError(null);

      const [statsData, trendsData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getMatchTrends(trendPeriod),
      ]);

      setAdminStats(statsData);
      setMatchTrends(trendsData);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);

      // Créer des données vides avec message d'erreur approprié
      setAdminStats({
        total_users: 0,
        total_matches: 0,
        total_interactions: 0,
        overall_match_rate: 0,
        top_users: [],
        daily_stats: [],
        interaction_types: []
      });

      setMatchTrends({
        trends: [],
        period_days: trendPeriod
      });

      setError('Impossible de charger les statistiques. Le service de données n\'est peut-être pas disponible ou il n\'y a encore aucune donnée à afficher.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleTrendPeriodChange = async (days: number) => {
    setTrendPeriod(days);
    try {
      const trendsData = await adminService.getMatchTrends(days);
      setMatchTrends(trendsData);
    } catch (err) {
      console.error('Erreur lors du chargement des tendances:', err);
      setMatchTrends({
        trends: [],
        period_days: days
      });
    }
  };

  const handleClearCache = async () => {
    try {
      setIsRefreshing(true);
      await adminService.clearCache();
      await loadData();
    } catch (err) {
      console.error('Erreur lors du vidage du cache:', err);
      setError('Erreur lors du vidage du cache: ' + (err as Error).message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (loading && !adminStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du panel d'administration...</p>
        </div>
      </div>
    );
  }

  if (error && !adminStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              Erreur de chargement
            </AlertDescription>
            <AlertDescription className="mt-2">
              {error}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button onClick={() => loadData()} className="w-full" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Réessayer
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/login')} className="w-full">
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Panel d'Administration
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connecté en tant que {user?.username}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData(true)}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Utilisateurs Total
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {adminStats?.total_users.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {adminStats?.total_users === 0 ? 'Aucun utilisateur enregistré' : 'Utilisateurs actifs'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Matches Total
              </CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {adminStats?.total_matches.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {adminStats?.total_matches === 0 ? 'Aucun match créé' : 'Matches réussis'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Interactions Total
              </CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {adminStats?.total_interactions.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {adminStats?.total_interactions === 0 ? 'Aucune interaction' : 'Likes, passes, blocks'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Taux de Match
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {adminStats?.overall_match_rate ? `${adminStats.overall_match_rate.toFixed(1)}%` : '0%'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {adminStats?.overall_match_rate === 0 ? 'Aucun taux calculé' : 'Taux moyen de succès'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Stats Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Activité Quotidienne</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {adminStats?.daily_stats && adminStats.daily_stats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={adminStats.daily_stats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="active_users"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Utilisateurs actifs"
                    />
                    <Area
                      type="monotone"
                      dataKey="new_matches"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Nouveaux matches"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-center">
                    Aucune donnée d'activité disponible pour le moment
                  </p>
                  <p className="text-sm text-center mt-2">
                    Les statistiques apparaîtront ici une fois que des utilisateurs commenceront à interagir
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Match Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Tendances des Matches</span>
              </CardTitle>
              <div className="flex space-x-2">
                {[7, 30, 90].map((days) => (
                  <Button
                    key={days}
                    variant={trendPeriod === days ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTrendPeriodChange(days)}
                  >
                    {days}j
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {matchTrends?.trends && matchTrends.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={matchTrends.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="matches"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Matches"
                    />
                    <Line
                      type="monotone"
                      dataKey="likes"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Likes"
                    />
                    <Line
                      type="monotone"
                      dataKey="passes"
                      stroke="#ffc658"
                      strokeWidth={2}
                      name="Passes"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <TrendingDown className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-center">
                    Aucune tendance disponible pour la période sélectionnée
                  </p>
                  <p className="text-sm text-center mt-2">
                    Les données de tendance apparaîtront ici une fois que l'activité commencera
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Users and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Users */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Top Utilisateurs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {adminStats?.top_users && adminStats.top_users.length > 0 ? (
                <div className="space-y-4">
                  {adminStats.top_users.map((user, index) => (
                    <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{user.username || `User ${user.user_id}`}</p>
                          <p className="text-sm text-gray-500">
                            {user.total_matches} matches • {user.match_rate.toFixed(1)}% taux
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{user.total_likes} likes</p>
                        <p>{user.total_passes} passes</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-center">
                    Aucun utilisateur actif pour le moment
                  </p>
                  <p className="text-sm text-center mt-2">
                    Le classement apparaîtra ici une fois que les utilisateurs commenceront à matcher
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Actions Admin</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleClearCache}
                disabled={isRefreshing}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Vider le Cache
              </Button>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Statut du Système</h4>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Service actif</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Dernière MAJ: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              <Separator />

              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>Panel d'administration Matcha</p>
                <p>Version 1.0.0</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;