# Panel d'Administration Matcha

## Vue d'ensemble

Le panel d'administration de Matcha fournit une interface complète pour surveiller et gérer l'application de rencontre. Il offre des statistiques en temps réel, des visualisations de données et des outils de gestion pour les administrateurs système.

## Fonctionnalités

### 🔐 Authentification Admin
- **Login dédié** : `/admin/login` - Interface de connexion séparée pour les administrateurs
- **Vérification des rôles** : Seuls les utilisateurs avec les rôles appropriés peuvent accéder
- **Redirection automatique** : Redirection vers le login admin si non authentifié

### 📊 Statistiques et Métriques

#### Cartes de Statistiques Principales
- **Utilisateurs Total** : Nombre total d'utilisateurs inscrits
- **Matches Total** : Nombre total de matches créés
- **Interactions Total** : Nombre total d'interactions (likes, passes, blocks)
- **Taux de Match** : Pourcentage moyen de succès des matches

#### Graphiques Interactifs
- **Activité Quotidienne** : Graphique en aires montrant l'activité des utilisateurs et les nouveaux matches
- **Tendances des Matches** : Graphique linéaire avec évolution des matches, likes et passes
- **Top Utilisateurs** : Classement des utilisateurs les plus actifs avec leurs statistiques

### 🎨 Interface Utilisateur

#### Design Moderne
- **Thème sombre/clair** : Support automatique des thèmes
- **Composants Radix UI** : Interface cohérente avec le reste de l'application
- **Responsive Design** : Adapté aux desktop et mobile

#### Gestion des États
- **États de chargement** : Indicateurs visuels pendant le chargement des données
- **Gestion d'erreur** : Messages d'erreur appropriés quand les données ne sont pas disponibles
- **États vides** : Messages informatifs quand il n'y a pas encore de données

### 🛠️ Actions Administrateur

#### Cache Management
- **Vidage du cache** : Bouton pour vider le cache système
- **Actualisation des données** : Rafraîchissement manuel des statistiques

#### Monitoring Système
- **Statut du service** : Indicateur de santé du système
- **Dernière mise à jour** : Timestamp de la dernière actualisation des données

## Accès

### URL d'accès
- **Login Admin** : `http://localhost:5173/admin/login`
- **Panel Admin** : `http://localhost:5173/app/admin`

### Utilisateurs Admin
Par défaut, les utilisateurs suivants ont accès au panel admin :
- Utilisateur avec ID = 1
- Utilisateurs avec username : 'admin', 'administrator', 'root'

## Architecture

### Composants
- `AdminLoginForm` : Formulaire de connexion admin
- `AdminPage` : Page principale du panel d'administration
- Services : `adminService` pour les appels API

### API Endpoints
Le panel utilise les endpoints suivants du service admin :
- `GET /api/v1/admin/stats` : Statistiques générales
- `GET /api/v1/admin/stats/trends` : Tendances des matches
- `POST /api/v1/admin/cache/clear` : Vidage du cache

### Gestion d'Erreurs
- **API indisponible** : Message informatif avec possibilité de réessayer
- **Aucune donnée** : États vides avec messages explicatifs
- **Erreur d'authentification** : Redirection vers le login admin

## Technologies Utilisées

- **React 19** : Framework frontend
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS
- **Radix UI** : Composants d'interface
- **Recharts** : Librairie de graphiques
- **React Router** : Gestion des routes
- **Zustand** : Gestion d'état

## Sécurité

- **Vérification des rôles** : Accès limité aux administrateurs autorisés
- **Authentification JWT** : Tokens sécurisés pour les sessions admin
- **Routes protégées** : Redirections automatiques pour les utilisateurs non autorisés

## État des Données

Le panel gère différents états de données :

1. **Données disponibles** : Affichage complet des statistiques et graphiques
2. **API indisponible** : Message d'erreur avec bouton de retry
3. **Aucune donnée** : États vides avec messages informatifs
4. **Chargement** : Indicateurs de chargement pendant les requêtes

## Développement

### Structure des fichiers
```
frontend/src/
├── components/admin/
│   └── AdminLoginForm.tsx
├── pages/
│   ├── AdminPage.tsx
│   └── AdminLoginPage.tsx
└── services/
    └── admin.ts
```

### Scripts disponibles
- `pnpm run dev` : Démarrage du serveur de développement
- `pnpm run build` : Build de production
- `pnpm run lint` : Vérification du code

## Améliorations Futures

- [ ] Gestion des utilisateurs (ban, unban, modification)
- [ ] Logs système et audit trail
- [ ] Configuration en temps réel
- [ ] Export des données
- [ ] Notifications admin
- [ ] Métriques de performance avancées
