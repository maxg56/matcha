# Admin Service

Service d'administration centralisé pour Matcha. Gère l'authentification admin, la gestion des administrateurs, et les statistiques globales du système.

## Variables d'environnement

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Connexion base de données
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB` - Connexion Redis
- `ADMIN_JWT_SECRET` - Secret pour les tokens JWT admin (fallback: `JWT_SECRET`)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` - Credentials du super admin (seed automatique)
- `ADMIN_PORT` - Port du service (défaut: 8007)

## Endpoints

### Authentification
- `POST /api/v1/admin/login` - Connexion admin

### Gestion des admins (super_admin requis)
- `POST /api/v1/admin/admins` - Créer un nouvel admin
- `PUT /api/v1/admin/admins/:id` - Modifier un admin
- `DELETE /api/v1/admin/admins/:id` - Désactiver un admin

### Statistiques (admin requis)
- `GET /api/v1/admin/admins` - Lister les admins actifs
- `GET /api/v1/admin/stats` - Statistiques globales du système
- `GET /api/v1/admin/stats/user/:user_id` - Statistiques d'un utilisateur
- `GET /api/v1/admin/stats/trends?days=30` - Tendances sur une période

### Performance (admin requis)
- `GET /api/v1/admin/performance` - Statistiques de performance
- `POST /api/v1/admin/cache/clear` - Vider les caches
- `POST /api/v1/admin/indexes/create` - Créer les indexes DB

## Rôles

- **super_admin** : Peut créer/modifier/supprimer des admins
- **admin** : Accès en lecture aux statistiques
- **moderator** : Rôle réservé pour futures fonctionnalités

## Démarrage

```bash
# Variables d'environnement
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=strongpassword
export ADMIN_JWT_SECRET=your-secret

# Build et run
go build -o bin/admin-service ./src
./bin/admin-service
```

Ou via Docker Compose (service déjà configuré).
