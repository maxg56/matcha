# Admin Service

Service d'administration: login admin, création d'admins (réservée au super admin), et endpoints futurs pour la gestion globale.

Variables d'environnement:
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB
- ADMIN_JWT_SECRET (fallback: JWT_SECRET)
- ADMIN_EMAIL, ADMIN_PASSWORD (seed du super admin au démarrage)
- ADMIN_PORT (par défaut 8007)

Routes:
- POST /api/v1/admin/login
- POST /api/v1/admin/admins (super_admin requis)
- GET /health

Build Docker: multi-stage déjà configuré.