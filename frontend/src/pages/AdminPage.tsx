import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { adminService, type AdminStatsResponse, type MatchTrendsResponse } from '@/services/admin';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [adminStats, setAdminStats] = useState<AdminStatsResponse | null>(null);
  const [matchTrends, setMatchTrends] = useState<MatchTrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendPeriod, setTrendPeriod] = useState(30);

  // Liste des utilisateurs admin autorisés (à adapter selon vos besoins)
  const adminUsers = ['admin', 'administrator', 'root']; // Ou utiliser les IDs

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('Vous devez être connecté pour accéder à cette page.');
      setLoading(false);
      return;
    }

    // Debug: Afficher les informations utilisateur
    console.log('User info:', { username: user.username, id: user.id });
    console.log('Admin check:', { 
      usernameMatch: adminUsers.includes(user.username?.toLowerCase() || ''),
      idMatch: user.id === 1,
      username: user.username?.toLowerCase()
    });

    // Vérifier si l'utilisateur est admin (temporairement plus permissif pour debug)
    const isAdmin = adminUsers.includes(user.username?.toLowerCase() || '') || user.id === 1;
    
    // MODE TEST: Commentez cette vérification pour tester avec n'importe quel utilisateur
    // if (!isAdmin) {
    //   setError(`Accès non autorisé. Cette page est réservée aux administrateurs. 
    //     Utilisateur actuel: ${user.username} (ID: ${user.id}). 
    //     Pour les tests, vous pouvez temporairement modifier cette vérification.`);
    //   setLoading(false);
    //   return;
    // }
    
    // Pour les tests, on accepte tous les utilisateurs authentifiés
    if (!isAdmin) {
      console.warn(`Accès admin accordé en mode test pour: ${user.username} (ID: ${user.id})`);
    }

    loadData();
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, trendsData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getMatchTrends(trendPeriod),
      ]);
      setAdminStats(statsData);
      setMatchTrends(trendsData);
      setError(null);
    } catch (err) {
      console.error('API Error:', err);
      
      // MODE DEMO: Utiliser des données de démonstration si l'API échoue
      console.warn('Using demo data due to API error');
      setAdminStats({
        total_users: 1250,
        total_matches: 342,
        total_interactions: 5680,
        overall_match_rate: 24.2,
        top_users: [
          { user_id: 1, username: 'alice_demo', total_matches: 45, total_likes: 120, total_passes: 234, total_blocks: 2, match_rate: 37.5 },
          { user_id: 2, username: 'bob_demo', total_matches: 38, total_likes: 95, total_passes: 189, total_blocks: 1, match_rate: 40.0 },
          { user_id: 3, username: 'charlie_demo', total_matches: 32, total_likes: 88, total_passes: 156, total_blocks: 0, match_rate: 36.4 },
        ],
        daily_stats: Array.from({length: 30}, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new_matches: Math.floor(Math.random() * 20) + 5,
          new_interactions: Math.floor(Math.random() * 100) + 50,
          active_users: Math.floor(Math.random() * 50) + 20,
        })).reverse(),
        interaction_types: [
          { type: 'like', count: 3420 },
          { type: 'pass', count: 1850 },
          { type: 'block', count: 45 },
        ]
      });
      
      setMatchTrends({
        trends: Array.from({length: 30}, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          matches: Math.floor(Math.random() * 15) + 3,
          likes: Math.floor(Math.random() * 80) + 20,
          passes: Math.floor(Math.random() * 60) + 15,
        })).reverse(),
        period_days: trendPeriod
      });
      
      setError('Mode démo activé - Les données affichées sont des exemples. Erreur API: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrendPeriodChange = (days: number) => {
    setTrendPeriod(days);
    adminService.getMatchTrends(days).then(setMatchTrends).catch(console.error);
  };

  const handleClearCache = async () => {
    try {
      await adminService.clearCache();
      alert('Cache vidé avec succès');
    } catch (err) {
      alert('Erreur lors du vidage du cache: ' + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement des statistiques...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Erreur: </strong>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!adminStats || !matchTrends) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Aucune donnée disponible</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel d'Administration - Matcha
        </h1>
        <p className="text-gray-600">
          Statistiques et métriques de l'algorithme de matching
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.total_users.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matches Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.total_matches.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.total_interactions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.overall_match_rate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Match Trends Chart */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tendances des Matches</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={trendPeriod === 7 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTrendPeriodChange(7)}
                >
                  7j
                </Button>
                <Button
                  variant={trendPeriod === 30 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTrendPeriodChange(30)}
                >
                  30j
                </Button>
                <Button
                  variant={trendPeriod === 90 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTrendPeriodChange(90)}
                >
                  90j
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Interaction Types Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Types d'Interactions (30 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={adminStats.interaction_types}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="type"
                >
                  {adminStats.interaction_types.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Utilisateurs par Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={adminStats.top_users}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="username" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_matches" fill="#8884d8" name="Matches" />
              <Bar dataKey="total_likes" fill="#82ca9d" name="Likes" />
              <Bar dataKey="total_passes" fill="#ffc658" name="Passes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Activity */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Activité Quotidienne (30 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={adminStats.daily_stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="new_matches" fill="#8884d8" name="Nouveaux Matches" />
              <Bar dataKey="new_interactions" fill="#82ca9d" name="Nouvelles Interactions" />
              <Bar dataKey="active_users" fill="#ffc658" name="Utilisateurs Actifs" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions d'Administration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={handleClearCache} variant="outline">
              Vider le Cache
            </Button>
            <Button onClick={loadData} variant="outline">
              Actualiser les Données
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;