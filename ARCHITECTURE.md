# Architecture Matcha

Ce document décrit en détail l'architecture technique de l'application Matcha, une plateforme de rencontres construite avec une architecture microservices.

## Table des Matières

- [Vue d'Ensemble](#vue-densemble)
- [Diagramme d'Architecture](#diagramme-darchitecture)
- [Composants Infrastructure](#composants-infrastructure)
- [Services Backend](#services-backend)
- [Frontend](#frontend)
- [Base de Données](#base-de-données)
- [Communication Inter-Services](#communication-inter-services)
- [Sécurité](#sécurité)
- [Scalabilité](#scalabilité)
- [Patterns Architecturaux](#patterns-architecturaux)

---

## Vue d'Ensemble

Matcha utilise une **architecture microservices** qui décompose l'application en services indépendants, chacun responsable d'un domaine métier spécifique. Cette architecture offre :

- ✅ **Découplage** : Chaque service peut être développé, déployé et scalé indépendamment
- ✅ **Résilience** : La défaillance d'un service n'impacte pas l'ensemble du système
- ✅ **Flexibilité technologique** : Possibilité d'utiliser différentes technologies par service
- ✅ **Scalabilité horizontale** : Ajout de ressources par réplication de services
- ✅ **Maintenance facilitée** : Code organisé par domaine métier

---

## Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENT (Browser)                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CADDY (Reverse Proxy)                             │
│                         Port 8000                                    │
└────────────┬─────────────────────────────────────┬──────────────────┘
             │                                      │
             │ HTTP                                 │ HTTP
             ▼                                      ▼
┌────────────────────────┐              ┌─────────────────────────────┐
│   FRONTEND (React)     │              │   GATEWAY (Go)              │
│      Port 3000         │              │     Port 8080               │
└────────────────────────┘              └──────────┬──────────────────┘
                                                   │
                                                   │ JWT Validation
                                                   │ Routing
                                                   │
                   ┌───────────────────────────────┼────────────────┐
                   │                               │                │
                   ▼                               ▼                ▼
     ┌──────────────────────┐      ┌──────────────────────┐   ┌────────────────┐
     │  AUTH SERVICE (Go)   │      │  USER SERVICE (Go)   │   │ MATCH SERVICE  │
     │     Port 8001        │      │     Port 8002        │   │   (Go) 8003    │
     └──────────┬───────────┘      └──────────┬───────────┘   └────────────────┘
                │                             │
                │                             │
     ┌──────────────────────┐      ┌──────────────────────┐   ┌────────────────┐
     │  CHAT SERVICE (Go)   │      │ NOTIFY SERVICE (Py)  │   │ MEDIA SERVICE  │
     │     Port 8004        │      │     Port 8005        │   │   (Py) 8006    │
     └──────────────────────┘      └──────────────────────┘   └────────────────┘
                   │
     ┌──────────────────────┐      ┌──────────────────────┐
     │ PAIEMENTS SERVICE    │      │  USER-CREATION       │
     │   (Go) Port 8007     │      │   (Go) Port 8008     │
     └──────────────────────┘      └──────────────────────┘
                   │                             │
                   │                             │
        ┌──────────┴─────────────────────────────┴──────────┐
        │                                                    │
        ▼                                                    ▼
┌─────────────────┐                              ┌─────────────────────┐
│  POSTGRESQL 15  │                              │    REDIS 7.x        │
│   Port 5432     │                              │   Port 6379         │
│                 │                              │                     │
│ - Users         │                              │ - Token Blacklist   │
│ - Profiles      │                              │ - Cache             │
│ - Messages      │                              │ - Sessions          │
│ - Matches       │                              │                     │
└─────────────────┘                              └─────────────────────┘
```

---

## Composants Infrastructure

### 1. Caddy (Reverse Proxy)

**Rôle** : Point d'entrée principal de l'application

**Technologies** : Caddy 2.x

**Responsabilités** :
- Gestion automatique des certificats SSL/TLS (Let's Encrypt)
- Reverse proxy vers frontend et API gateway
- Terminaison HTTPS
- Configuration zero-downtime
- Headers de sécurité (CORS, CSP, etc.)

**Configuration** : `services/proxy/Caddyfile`

**Ports** :
- `8000` : HTTP (redirect vers HTTPS en production)
- `8443` : HTTPS

### 2. PostgreSQL

**Rôle** : Base de données relationnelle principale

**Technologies** : PostgreSQL 15-alpine

**Responsabilités** :
- Stockage persistant de toutes les données
- Relations entre entités (users, profiles, matches, messages)
- Contraintes d'intégrité référentielle
- Transactions ACID

**Base de données** :
- Développement : `matcha_dev`
- Production : `matcha`

**Scripts d'initialisation** : `services/database/init.sql`

### 3. Redis

**Rôle** : Cache et stockage en mémoire

**Technologies** : Redis 7.x

**Responsabilités** :
- **Token Blacklisting** : Invalidation immédiate des JWT
- **Caching** : Résultats de matching, profils fréquemment accédés
- **Sessions** : Gestion des sessions utilisateurs
- **Rate Limiting** : Limitation des requêtes par utilisateur
- **Real-time Data** : Compteurs, statistiques temps réel

**TTL par type** :
- Tokens blacklistés : Durée de vie du JWT
- Cache profils : 5-15 minutes
- Sessions : 24 heures

---

## Services Backend

### 1. Gateway (Go)

**Port** : `8080`

**Rôle** : API Gateway et routeur principal

**Technologies** :
- Go 1.21+
- Gorilla Mux (routing)
- Go-Redis (client Redis)

**Responsabilités** :
- **Reverse Proxy** : Routage des requêtes vers les services appropriés
- **JWT Validation** : Vérification de tous les tokens entrants
- **Token Blacklist Check** : Vérification Redis pour tokens révoqués
- **CORS Handling** : Gestion des requêtes cross-origin
- **Header Forwarding** : Transmission de `X-User-ID` et `X-JWT-Token`
- **Load Balancing** : Répartition de charge (future feature)

**Endpoints** :
- `/health` - Health check
- `/api/v1/auth/*` → auth-service
- `/api/v1/users/*` → user-service
- `/api/v1/matches/*` → match-service
- `/api/v1/chat/*` → chat-service
- `/api/v1/notifications/*` → notify-service
- `/api/v1/media/*` → media-service

**Fichiers clés** :
- `api/gateway/src/main.go` - Point d'entrée
- `api/gateway/src/middleware/jwt.go` - Validation JWT
- `api/gateway/src/handlers/proxy.go` - Reverse proxy logic

### 2. Auth Service (Go)

**Port** : `8001`

**Rôle** : Authentification et gestion des sessions

**Technologies** :
- Go 1.21+
- GORM (ORM)
- JWT-Go (tokens)
- bcrypt (hashing passwords)

**Responsabilités** :
- **Inscription** : Création de nouveaux comptes avec validation
- **Connexion** : Authentification par username/email + password
- **JWT Management** :
  - Génération de tokens (access + refresh)
  - Vérification de validité
  - Refresh de tokens expirés
- **Token Blacklisting** : Révocation immédiate (logout)
- **Password Management** :
  - Reset par email
  - Changement de mot de passe
  - Validation de complexité

**Structure de code** :
```
src/
├── handlers/       # HTTP handlers par fonction
│   ├── auth.go    # Login, register
│   ├── token.go   # Refresh, verify
│   └── password.go # Reset, change
├── middleware/     # Auth middleware
├── utils/
│   ├── jwt.go     # JWT utilities
│   └── response.go # Standardized responses
├── conf/          # DB & Redis connections
├── models/        # GORM models
└── main.go        # Entry point
```

**Format de réponse standardisé** :
```json
{
  "success": true/false,
  "data": {...},        // Success only
  "error": "message"    // Error only
}
```

**Endpoints** :
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/logout` - Déconnexion + blacklist
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/verify` - Vérifier token
- `POST /api/v1/auth/reset-password` - Demande reset
- `POST /api/v1/auth/change-password` - Changement

### 3. User Service (Go)

**Port** : `8002`

**Rôle** : Gestion des profils utilisateurs

**Technologies** :
- Go 1.21+
- GORM
- PostGIS (géolocalisation)

**Responsabilités** :
- **Profils** : CRUD complet des profils utilisateurs
- **Géolocalisation** :
  - Update de position (lat/lng)
  - Recherche par proximité (PostGIS)
  - Calcul de distance
- **Recherche Avancée** :
  - Filtres multiples (âge, genre, distance, fame, tags)
  - Pagination
  - Tri par pertinence
- **Préférences de Matching** :
  - Âge min/max
  - Distance max
  - Genres préférés
  - Tags requis/bloqués
- **Images** :
  - Gestion de l'ordre des photos
  - Définition de la photo de profil
  - Métadonnées (description, alt text)
- **Statistiques** :
  - Visites de profil
  - Popularité (fame score)
  - Historique de vues
- **Reporting** :
  - Signalement d'utilisateurs
  - Gestion des reports

**Modèles principaux** :
```go
type User struct {
    ID              uint
    Username        string
    Email           string
    FirstName       string
    LastName        string
    BirthDate       time.Time
    Gender          string
    SexPreference   string
    Bio             string
    Fame            int
    Latitude        float64
    Longitude       float64
    Tags            []Tag
    Images          []Image
    Preferences     MatchPreferences
}
```

**Documentation API** : Voir [doc/USER_SERVICE_API.md](./doc/USER_SERVICE_API.md)

### 4. Match Service (Go)

**Port** : `8003`

**Rôle** : Algorithme de matching et gestion des interactions

**Technologies** :
- Go 1.21+
- GORM
- Redis (cache des scores)

**Responsabilités** :
- **Algorithme de Matching** :
  - Calcul de compatibilité par vecteurs
  - Pondération multi-critères :
    - Distance géographique
    - Préférences de genre
    - Tags communs
    - Différence d'âge
    - Fame score
  - Cache Redis des résultats
- **Interactions** :
  - Like / Unlike
  - Mutual likes (matches)
  - Block / Unblock
- **Gestion des Matches** :
  - Liste des matches actifs
  - Historique des likes donnés/reçus
  - Suggestions de profils
- **Notifications** : Trigger vers notify-service

**Algorithme de scoring** :
```go
score = (
    distance_score * 0.3 +
    age_score * 0.2 +
    tags_score * 0.3 +
    fame_score * 0.1 +
    activity_score * 0.1
)
```

### 5. Chat Service (Go)

**Port** : `8004`

**Rôle** : Messagerie temps réel

**Technologies** :
- Go 1.21+
- Gorilla WebSocket
- GORM

**Responsabilités** :
- **WebSocket Management** :
  - Connexions persistantes
  - Broadcasting de messages
  - Présence utilisateur (online/offline)
- **Conversations** :
  - Création automatique lors d'un match
  - Liste des conversations par utilisateur
  - Messages non lus
- **Messages** :
  - Envoi/réception temps réel
  - Historique de conversation
  - Statut de lecture
  - Support texte + emojis
- **Notifications** : Trigger pour nouveaux messages

**WebSocket Protocol** :
```json
{
  "type": "message",
  "conversation_id": 123,
  "content": "Hello!",
  "timestamp": "2025-01-01T12:00:00Z"
}
```

### 6. Notify Service (Python)

**Port** : `8005`

**Rôle** : Gestion des notifications

**Technologies** :
- Python 3.11+
- FastAPI
- Redis (queue)
- SMTP (emails)

**Responsabilités** :
- **Push Notifications** :
  - Nouveaux likes
  - Nouveaux matches
  - Nouveaux messages
  - Visites de profil
- **Email Notifications** :
  - Confirmation d'inscription
  - Reset de mot de passe
  - Résumé hebdomadaire
- **Préférences** : Gestion par l'utilisateur
- **Queue Management** : Redis pour async processing

**Types de notifications** :
- `like` - Quelqu'un vous a liké
- `match` - Nouveau match mutuel
- `message` - Nouveau message
- `view` - Visite de profil
- `system` - Notifications système

### 7. Media Service (Python)

**Port** : `8006`

**Rôle** : Gestion des médias (images)

**Technologies** :
- Python 3.11+
- FastAPI
- Pillow (traitement d'images)
- MinIO/S3 (stockage - future)

**Responsabilités** :
- **Upload** :
  - Validation du format (JPEG, PNG, WebP)
  - Limitation de taille (max 5MB)
  - Génération d'UUID unique
- **Traitement** :
  - Redimensionnement automatique
  - Création de thumbnails
  - Compression optimisée
  - Suppression des métadonnées EXIF sensibles
- **Stockage** :
  - Actuellement : filesystem local
  - Future : S3/MinIO
- **Sécurité** :
  - Validation du type MIME
  - Scan antivirus (future)
  - Watermarking (optionnel)

**Formats de sortie** :
- Original : Format uploadé
- Large : 1920x1920px max
- Medium : 800x800px
- Thumbnail : 200x200px

### 8. Paiements Service (Go)

**Port** : `8007`

**Rôle** : Gestion des paiements (Stripe)

**Technologies** :
- Go 1.21+
- Stripe SDK

**Responsabilités** :
- Intégration Stripe
- Webhooks de paiement
- Abonnements premium
- Gestion des transactions

### 9. User Creation Service (Go)

**Port** : `8008`

**Rôle** : Service dédié à la création de comptes

**Technologies** :
- Go 1.21+
- GORM

**Responsabilités** :
- Création de comptes utilisateurs
- Validation des données
- Initialisation de profils

---

## Frontend

**Port** : `3000`

**Rôle** : Interface utilisateur web (SPA)

**Technologies** :
- React 18
- TypeScript
- Vite (build tool)
- React Router (routing)
- Zustand (state management)
- TanStack Query (data fetching)
- Tailwind CSS (styling)

**Structure** :
```
frontend/
├── src/
│   ├── components/     # Composants réutilisables
│   │   ├── auth/      # Login, Register
│   │   ├── chat/      # Chat interface
│   │   ├── profile/   # Profile views
│   │   └── common/    # Buttons, Cards, etc.
│   ├── pages/         # Pages (routes)
│   ├── services/      # API clients
│   ├── hooks/         # Custom React hooks
│   ├── store/         # Zustand stores
│   ├── utils/         # Utilities
│   └── types/         # TypeScript types
├── public/            # Static assets
└── vite.config.ts     # Vite configuration
```

**Fonctionnalités clés** :
- **Authentication** : Login, Register, JWT management
- **Profile Management** : Edition complète de profil
- **Matching** : Swipe interface, match list
- **Chat** : Real-time messaging avec WebSocket
- **Search** : Filtres avancés
- **Notifications** : Toast notifications
- **Responsive** : Mobile-first design

---

## Base de Données

### Schéma PostgreSQL

#### Table: users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(20),
    sex_preference VARCHAR(50),
    bio TEXT,
    fame INT DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);
```

#### Table: images
```sql
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    is_profile BOOLEAN DEFAULT false,
    description VARCHAR(200),
    alt_text VARCHAR(100),
    width INT,
    height INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table: matches
```sql
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    liked_user_id INT REFERENCES users(id) ON DELETE CASCADE,
    is_mutual BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, liked_user_id)
);
```

#### Table: conversations
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user1_id INT REFERENCES users(id) ON DELETE CASCADE,
    user2_id INT REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);
```

#### Table: messages
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Voir le schéma complet** : `services/database/init.sql`

### Relations

```
users (1) ─── (N) images
users (1) ─── (N) matches
users (1) ─── (N) conversations ─── (N) messages
users (1) ─── (1) match_preferences
users (1) ─── (N) profile_views
users (1) ─── (N) reports
```

### Indexes

```sql
-- Performance queries
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users USING GIST(ll_to_earth(latitude, longitude));
CREATE INDEX idx_matches_user_id ON matches(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

---

## Communication Inter-Services

### 1. Flux d'Authentification

```
Client → Caddy → Frontend
Frontend → Gateway (POST /api/v1/auth/login)
Gateway → Auth Service
Auth Service → PostgreSQL (verify credentials)
Auth Service → Redis (blacklist check)
Auth Service → Generate JWT
Auth Service → Client (return token)
```

### 2. Flux de Requête Authentifiée

```
Client → Gateway (Authorization: Bearer <token>)
Gateway → Redis (check blacklist)
Gateway → Validate JWT
Gateway → Extract user_id
Gateway → Service (X-User-ID header)
Service → PostgreSQL
Service → Response
Gateway → Client
```

### 3. Flux WebSocket (Chat)

```
Client → Gateway /api/v1/chat/ws
Gateway → Chat Service (upgrade to WebSocket)
Chat Service ↔ Client (persistent connection)

On message:
Chat Service → PostgreSQL (save message)
Chat Service → Notify Service (trigger notification)
Chat Service → Broadcast to recipient
```

### 4. Communication Asynchrone

**Event-driven avec notifications** :

```go
// Match Service détecte un mutual like
matchService.OnMutualMatch(userID, matchedUserID)
  → POST http://notify-service:8005/api/v1/notifications/send

// Notify Service traite
notifyService.SendNotification(userID, "match", data)
  → Email (async via Redis queue)
  → Push notification (WebSocket si online)
```

---

## Sécurité

### 1. Authentification & Autorisation

- **JWT (JSON Web Tokens)** :
  - Algorithme : HS256
  - Durée de vie : 24h (access), 7j (refresh)
  - Claims : user_id, username, exp, iat

- **Token Blacklisting** :
  - Redis avec TTL = durée de vie du token
  - Check systématique au gateway
  - Révocation immédiate au logout

- **Password Hashing** :
  - bcrypt avec cost 10
  - Salting automatique
  - Never log passwords

### 2. Validation des Données

- **Input Validation** :
  - Validation côté frontend (UI/UX)
  - Validation stricte côté backend (sécurité)
  - Sanitization des entrées

- **Type Checking** :
  - Go : types stricts
  - Python : Pydantic models
  - TypeScript : strict mode

### 3. Protection des APIs

- **Rate Limiting** :
  - Redis pour compteurs
  - Limites par endpoint
  - Ban temporaire si abuse

- **CORS** :
  - Whitelist des origines
  - Credentials autorisés
  - Headers restreints

- **Headers de Sécurité** :
  ```
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Strict-Transport-Security: max-age=31536000
  ```

### 4. Données Sensibles

- **Chiffrement** :
  - HTTPS pour tout le trafic
  - Secrets en variables d'environnement
  - Jamais de credentials dans le code

- **GDPR Compliance** :
  - Soft delete (deleted_at)
  - Export de données utilisateur
  - Droit à l'oubli (hard delete disponible)

---

## Scalabilité

### Scalabilité Horizontale

**Services stateless** : Tous les services backend peuvent être répliqués :

```yaml
# Docker Compose scaling
docker-compose up -d --scale auth-service=3 --scale user-service=2
```

**Load Balancing** : Gateway distribue les requêtes

### Caching Strategy

1. **Redis Caching** :
   - Profils fréquents : 5 min TTL
   - Résultats de matching : 10 min TTL
   - Compteurs : 1 min TTL

2. **Database Query Optimization** :
   - Indexes sur colonnes fréquentes
   - Pagination systématique
   - Lazy loading des relations

3. **CDN** (future) :
   - Images via CDN
   - Assets statiques du frontend

### Database Scaling

**Current** : Single PostgreSQL instance

**Future** :
- Read replicas pour queries lourdes
- Partitioning par utilisateur
- Connection pooling (PgBouncer)

---

## Patterns Architecturaux

### 1. API Gateway Pattern

Tous les appels passent par le gateway :
- Point d'entrée unique
- Validation centralisée
- Monitoring simplifié

### 2. Database per Service (partiel)

Chaque service a ses propres tables :
- `auth-service` : users (credentials)
- `user-service` : profiles, images, preferences
- `chat-service` : conversations, messages
- `match-service` : matches, blocks

### 3. Circuit Breaker (future)

Protection contre les cascades de failure :
```go
if service.IsDown() {
    return CachedResponse()
}
```

### 4. Saga Pattern (future)

Pour transactions distribuées :
```
CreateUser → CreateProfile → SendWelcomeEmail
   ↓ fail         ↓ compensate    ↓ compensate
DeleteUser ← DeleteProfile ← (no action)
```

### 5. CQRS (partiel)

Séparation lecture/écriture :
- Match calculation (read-heavy) : cache Redis
- User updates (write) : direct PostgreSQL

---

## Monitoring & Observabilité (Future)

### Logs

- **Format** : JSON structuré
- **Niveaux** : DEBUG, INFO, WARN, ERROR
- **Centralisation** : ELK Stack ou Loki

### Métriques

- **Prometheus** : Collecte de métriques
- **Grafana** : Visualisation
- **Métriques clés** :
  - Requests per second
  - Response time (p50, p95, p99)
  - Error rate
  - Database connections

### Tracing

- **Distributed Tracing** : Jaeger
- **Correlation ID** : Tracking de requêtes end-to-end

---

## Améliorations Futures

### Court Terme

- [ ] Tests d'intégration complets
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring (Prometheus + Grafana)
- [ ] Rate limiting global

### Moyen Terme

- [ ] Service mesh (Istio)
- [ ] Message broker (RabbitMQ/Kafka)
- [ ] Stockage S3 pour images
- [ ] CDN pour assets

### Long Terme

- [ ] Kubernetes deployment
- [ ] Multi-region deployment
- [ ] Machine Learning pour matching
- [ ] Mobile apps (React Native)

---

## Ressources Complémentaires

- [README.md](./README.md) - Vue d'ensemble du projet
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Guide de développement
- [doc/USER_SERVICE_API.md](./doc/USER_SERVICE_API.md) - Documentation API User Service
- [CLAUDE.md](./CLAUDE.md) - Instructions pour Claude Code AI

---

**Dernière mise à jour** : 2025-11-21
