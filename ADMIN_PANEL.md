# Panel d'Administration Matcha

Ce document décrit l'implémentation du panel d'administration pour l'algorithme de matching de Matcha.

## Fonctionnalités

### 📊 Statistiques Générales
- **Utilisateurs totaux** : Nombre total d'utilisateurs inscrits
- **Matches totaux** : Nombre total de matches créés
- **Interactions totales** : Nombre total d'interactions (likes, passes, blocks)
- **Taux de match global** : Pourcentage de matches par rapport aux likes

### 📈 Graphiques et Visualisations

#### 1. Tendances des Matches
- Graphique en ligne montrant l'évolution des matches, likes et passes
- Sélection de période : 7 jours, 30 jours, 90 jours
- Mise à jour en temps réel

#### 2. Types d'Interactions
- Graphique en secteurs des différents types d'interactions (30 derniers jours)
- Répartition entre likes, passes et blocks

#### 3. Top Utilisateurs
- Graphique en barres des utilisateurs avec le plus de matches
- Affichage des likes et passes pour chaque utilisateur

#### 4. Activité Quotidienne
- Graphique en barres de l'activité quotidienne (30 derniers jours)
- Nouveaux matches, interactions et utilisateurs actifs par jour

## Accès et Sécurité

### Utilisateurs Autorisés
Le panel est accessible uniquement aux utilisateurs avec des privilèges administrateur :
- **Par ID utilisateur** : ID = 1
- **Par nom d'utilisateur** : "admin", "administrator", "root"

### Vérifications de Sécurité
- **Frontend** : Vérification côté client pour l'affichage du lien
- **Backend** : Middleware d'authentification admin sur tous les endpoints
- **Routes protégées** : Toutes les routes `/api/v1/matches/admin/*` sont sécurisées

## Endpoints API

### GET `/api/v1/matches/admin/stats`
Retourne les statistiques générales de l'application.

**Réponse** :
```json
{
  "total_users": 1250,
  "total_matches": 3420,
  "total_interactions": 15680,
  "overall_match_rate": 21.8,
  "top_users": [...],
  "daily_stats": [...],
  "interaction_types": [...]
}
```

### GET `/api/v1/matches/admin/stats/user/:user_id`
Retourne les statistiques détaillées d'un utilisateur spécifique.

**Réponse** :
```json
{
  "user_id": 123,
  "username": "john_doe",
  "total_matches": 15,
  "total_likes": 45,
  "total_passes": 123,
  "total_blocks": 2,
  "match_rate": 33.3,
  "last_active": "2024-01-15T10:30:00Z"
}
```

### GET `/api/v1/matches/admin/stats/trends?days=30`
Retourne les tendances des matches sur une période donnée.

**Paramètres** :
- `days` : Nombre de jours (7, 30, 90, max 365)

**Réponse** :
```json
{
  "trends": [
    {
      "date": "2024-01-15",
      "matches": 45,
      "likes": 234,
      "passes": 156
    }
  ],
  "period_days": 30
}
```

### POST `/api/v1/matches/admin/cache/clear`
Vide le cache de l'application pour forcer la régénération des données.

### GET `/api/v1/matches/admin/performance`
Retourne les statistiques de performance de l'algorithme de matching.

## Interface Utilisateur

### Navigation
- Le lien "Administration" apparaît dans la barre latérale gauche
- Icône de bouclier orange pour identifier facilement l'accès admin
- Accessible via l'URL `/app/admin`

### Actions Disponibles
- **Actualiser les données** : Recharge toutes les statistiques
- **Vider le cache** : Force la régénération du cache de matching
- **Sélection de période** : Boutons pour changer la période des tendances

## Technologies Utilisées

### Frontend
- **React** : Interface utilisateur
- **Recharts** : Bibliothèque de graphiques
- **Tailwind CSS** : Styling
- **TypeScript** : Typage statique

### Backend
- **Go/Gin** : API REST
- **GORM** : ORM pour la base de données
- **PostgreSQL** : Base de données
- **Redis** : Cache (optionnel)

## Installation et Configuration

### 1. Dépendances Frontend
```bash
cd frontend
pnpm add recharts
```

### 2. Configuration Backend
Les endpoints sont automatiquement configurés avec le middleware d'authentification admin.

### 3. Base de Données
Les modèles suivants sont requis :
- `users` : Informations utilisateurs
- `user_interactions` : Interactions entre utilisateurs
- `matches` : Matches créés
- `user_preferences` : Préférences apprises

## Utilisation

1. **Connexion** : Connectez-vous avec un compte administrateur
2. **Navigation** : Cliquez sur "Administration" dans la barre latérale
3. **Consultation** : Explorez les différents graphiques et statistiques
4. **Actions** : Utilisez les boutons pour vider le cache ou actualiser les données

## Développement

### Ajout de Nouvelles Statistiques
1. **Backend** : Ajoutez de nouveaux endpoints dans `handlers/admin_stats.go`
2. **Frontend** : Créez de nouveaux composants de graphique
3. **Service** : Mettez à jour `services/admin.ts` pour les nouvelles API

### Personnalisation
- Modifiez les couleurs dans la constante `COLORS`
- Ajustez les périodes disponibles dans les boutons de sélection
- Personnalisez les vérifications d'admin dans `middleware/admin_auth.go`

## Sécurité et Bonnes Pratiques

- ✅ Authentification obligatoire sur tous les endpoints
- ✅ Vérification double (frontend + backend)
- ✅ Limitation des utilisateurs autorisés
- ✅ Pas d'exposition de données sensibles
- ✅ Logs des actions d'administration (à implémenter si besoin)

## Support et Maintenance

Pour toute question ou problème :
1. Vérifiez les logs du serveur de développement
2. Consultez les erreurs dans la console du navigateur
3. Vérifiez la configuration des utilisateurs admin

---

*Panel d'administration créé avec ❤️ pour optimiser l'algorithme de matching Matcha*