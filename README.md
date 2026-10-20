# Matcha 💕

<div align="center">

**Une application de rencontres moderne construite avec une architecture microservices**

[![CI](https://github.com/maxg56/matcha/actions/workflows/ci.yml/badge.svg)](https://github.com/maxg56/matcha/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8.svg)](https://golang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

[Démarrage Rapide](#démarrage-rapide) •
[Documentation](#documentation) •
[Architecture](#architecture) •
[Contribuer](#contribuer)

</div>

---

## 📋 Table des Matières

- [À Propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Démarrage Rapide](#démarrage-rapide)
- [Documentation](#documentation)
- [Développement](#développement)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Contribuer](#contribuer)
- [Licence](#licence)

---

## 🎯 À Propos

**Matcha** est une application de rencontres moderne qui permet aux utilisateurs de trouver des personnes compatibles en fonction de leurs préférences, localisation et intérêts. Construite avec une architecture microservices, l'application offre une expérience utilisateur fluide et scalable.

### Points Clés

- 🏗️ **Architecture Microservices** - Services découplés et indépendants
- 🔐 **Sécurité Renforcée** - JWT, token blacklisting, validation stricte
- 🚀 **Performance Optimisée** - Redis caching, connexions WebSocket
- 📱 **Responsive** - Interface adaptée mobile et desktop
- 🔄 **Temps Réel** - Messagerie instantanée et notifications
- 🎯 **Algorithme de Matching** - Basé sur les préférences et la géolocalisation

---

## ✨ Fonctionnalités

### Pour les Utilisateurs

- **Profil Complet** - Photos, bio, intérêts, informations personnelles
- **Géolocalisation** - Recherche basée sur la distance
- **Matching Intelligent** - Algorithme de compatibilité avancé
- **Chat Temps Réel** - Messagerie instantanée avec WebSocket
- **Notifications** - Alertes pour likes, messages, visites de profil
- **Galerie Photos** - Upload et gestion de plusieurs photos
- **Recherche Avancée** - Filtres par âge, distance, popularité, tags
- **Système de Report** - Signalement d'utilisateurs inappropriés

### Pour les Développeurs

- **API RESTful** - Endpoints documentés et standardisés
- **Hot Reload** - Rechargement automatique en développement
- **Tests Automatisés** - Suites de tests pour chaque service
- **Pre-commit Hooks** - Validation du code avant commit
- **Docker Compose** - Environnement de développement conteneurisé
- **Logs Centralisés** - Debugging facilité

---

## 🏗️ Architecture

Matcha utilise une architecture microservices avec 9 services indépendants :

### Infrastructure

| Composant | Technologie | Port | Description |
|-----------|-------------|------|-------------|
| **Caddy** | Caddy 2.x | 8000 | Reverse proxy & HTTPS |
| **PostgreSQL** | PostgreSQL 15 | 5432 | Base de données principale |
| **Redis** | Redis 7.x | 6379 | Cache & token blacklisting |

### Services Backend

| Service | Langage | Port | Responsabilité |
|---------|---------|------|----------------|
| **gateway** | Go | 8080 | API Gateway, reverse proxy, JWT validation |
| **auth-service** | Go | 8001 | Authentification, gestion JWT, tokens |
| **user-service** | Go | 8002 | Profils utilisateurs, préférences, recherche |
| **match-service** | Go | 8003 | Algorithme de matching, likes, blocks |
| **chat-service** | Go | 8004 | Messagerie temps réel, WebSocket |
| **notify-service** | Python | 8005 | Notifications push, alertes |
| **media-service** | Python | 8006 | Upload, traitement d'images |
| **paiements-service** | Go | 8007 | Gestion des paiements (Stripe) |
| **user-creation** | Go | 8008 | Service de création de comptes |

### Frontend

| Service | Framework | Port | Description |
|---------|-----------|------|-------------|
| **frontend** | React 18 | 3000 | Application web SPA |

**Pour plus de détails, consultez [ARCHITECTURE.md](./ARCHITECTURE.md)**

---

## 📦 Prérequis

### Obligatoire (pour Docker)

- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0+
- [Make](https://www.gnu.org/software/make/) (généralement pré-installé)

### Optionnel (pour développement local)

- [Go](https://golang.org/dl/) 1.21+
- [Python](https://www.python.org/downloads/) 3.11+
- [Node.js](https://nodejs.org/) 18+ & [pnpm](https://pnpm.io/)
- [pre-commit](https://pre-commit.com/) (pour hooks de qualité code)

---

## 🚀 Démarrage Rapide

### 1. Cloner le Projet

```bash
git clone https://github.com/votre-username/matcha.git
cd matcha
```

### 2. Configuration de l'Environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos paramètres (optionnel pour dev)
# Les valeurs par défaut fonctionnent out-of-the-box
nano .env
```

### 3. Installer les Pre-commit Hooks (Recommandé)

```bash
# Pour distributions Linux standards
./setup-precommit.sh

# Pour Arch Linux
./setup-precommit-arch.sh
```

### 4. Lancer l'Application

```bash
# Démarre tous les services en mode développement
make

# Ou manuellement avec Docker Compose
docker-compose -f docker-compose.dev.yml --env-file .env up -d
```

### 5. Accéder à l'Application

Une fois tous les conteneurs démarrés :

- **Application Web** : [http://localhost:8000](http://localhost:8000)
- **Frontend Direct** : [http://localhost:3000](http://localhost:3000)
- **API Gateway** : [http://localhost:8080](http://localhost:8080)
- **Adminer (DB UI)** : [http://localhost:8081](http://localhost:8081)
  - Système : PostgreSQL
  - Serveur : postgres
  - Utilisateur : postgres
  - Mot de passe : password
  - Base : matcha_dev

### 6. Arrêter l'Application

```bash
# Arrêter les services
make stop

# Arrêter et supprimer les conteneurs + volumes
make down

# Redémarrer tous les services
make restart
```

---

## 📚 Documentation

La documentation complète est organisée par thématique :

### Documentation Principale

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture détaillée du système
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Guide de développement complet
- **[CLAUDE.md](./CLAUDE.md)** - Instructions pour Claude Code AI

### Documentation API

- **[USER_SERVICE_API.md](./doc/USER_SERVICE_API.md)** - API du service utilisateurs
- **[messageapi.md](./doc/messageapi.md)** - API de messagerie

### Guides Techniques

- **[Pre-commit_Guide.md](./doc/Pre-commit_Guide.md)** - Configuration des hooks pre-commit
- **[Pre-commit_Fixes.md](./doc/Pre-commit_Fixes.md)** - Résolutions de problèmes courants
- **[Pre-commit_Workflow.md](./doc/Pre-commit_Workflow.md)** - Workflow GitHub Actions
- **[Types_de_commit.md](./doc/Types_de_commit.md)** - Conventions de messages de commit
- **[EMAIL_SETUP.md](./doc/EMAIL_SETUP.md)** - Configuration email
- **[GitHub_Actions_Lint.md](./doc/GitHub_Actions_Lint.md)** - CI/CD linting

### Documentation Services

Chaque service possède son propre README :

- [api/gateway/README.md](./api/gateway/README.md)
- [api/auth-service/README.md](./api/auth-service/README.md)
- [api/user-service/README.md](./api/user-service/README.md)
- [api/match-service/README.md](./api/match-service/README.md)
- [api/chat-service/README.md](./api/chat-service/README.md)
- [api/media-service/README.md](./api/media-service/README.md)
- [frontend/README.md](./frontend/README.md)

---

## 💻 Développement

### Commandes Makefile

```bash
make              # Lance tous les services en dev
make stop         # Arrête les services
make down         # Supprime conteneurs et volumes
make restart      # Redémarre tous les services
make prod         # Lance en mode production
make volumes-clean # Réinitialise la base de données
```

### Développement Local d'un Service

#### Services Go (gateway, auth, user, chat, match, paiements, user-creation)

```bash
cd api/<service-name>
go mod tidy
cd src
go run main.go        # Lance le service
go test -v ./...      # Exécute les tests
```

#### Services Python (notify, media)

```bash
cd api/<service-name>
pip install -r requirements.txt
cd src
python main.py        # Lance le service
pytest               # Exécute les tests
```

#### Frontend React

```bash
cd frontend
pnpm install         # Installe les dépendances
pnpm run dev        # Lance le serveur de dev (port 3000)
pnpm run build      # Build de production
pnpm test          # Exécute les tests
pnpm run lint      # Vérifie le code
pnpm run lint:fix  # Corrige automatiquement
```

### Accès aux Logs

```bash
# Logs de tous les services
docker-compose -f docker-compose.dev.yml logs -f

# Logs d'un service spécifique
docker logs -f matcha-gateway-1
docker logs -f matcha-auth-service-1
docker logs -f matcha-frontend-1
```

### Accès à la Base de Données

```bash
# Via psql dans le conteneur
docker exec -it matcha-postgres-1 psql -U postgres -d matcha_dev

# Commandes SQL utiles
\dt                    # Liste les tables
\d users              # Décrit la table users
SELECT * FROM users;  # Requête
```

**Pour plus de détails, consultez [DEVELOPMENT.md](./DEVELOPMENT.md)**

---

## 🧪 Tests

### Exécuter Tous les Tests

```bash
# Tests de tous les services Go
for service in gateway auth-service user-service chat-service match-service; do
  echo "Testing $service..."
  cd api/$service/src && go test -v ./... && cd ../../..
done

# Tests des services Python
cd api/notify-service && pytest
cd ../media-service && pytest

# Tests frontend
cd frontend && pnpm test
```

### Tests d'un Service Spécifique

```bash
# Service Go
cd api/auth-service/src
go test -v ./...
go test -v . -run TestLogin  # Test spécifique

# Service Python
cd api/media-service
pytest -v
pytest -v tests/test_upload.py  # Fichier spécifique

# Frontend
cd frontend
pnpm test
pnpm test -- --coverage  # Avec couverture
```

### Test d'Intégration

L'auth-service inclut un script de test complet :

```bash
cd api/auth-service
./test.sh
```

---

## 🌐 Déploiement

### Environnement de Production

```bash
# 1. Créer le fichier .env pour production
cp .env.example .env
nano .env  # Configurer pour production

# 2. Lancer en mode production
make prod

# 3. Vérifier que tous les services sont up
docker ps
```

### Variables d'Environnement Critiques

Pour la production, assurez-vous de configurer :

```env
# Sécurité
JWT_SECRET=<génerer-une-clé-forte-aléatoire>
ALLOWED_ORIGINS=https://votre-domaine.com

# Base de données
DB_HOST=postgres
DB_NAME=matcha
DB_USER=postgres
DB_PASSWORD=<mot-de-passe-fort>

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=<mot-de-passe-redis>

# Services externes
STRIPE_SECRET_KEY=<votre-clé-stripe>
SMTP_HOST=<serveur-smtp>
SMTP_USER=<utilisateur-smtp>
SMTP_PASSWORD=<mot-de-passe-smtp>
```

### HTTPS avec Caddy

Caddy gère automatiquement les certificats HTTPS Let's Encrypt en production. Configurez votre domaine dans `services/proxy/Caddyfile`.

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

### 1. Fork & Clone

```bash
# Fork le projet sur GitHub, puis
git clone https://github.com/votre-username/matcha.git
cd matcha
```

### 2. Créer une Branche

```bash
git checkout -b feature/ma-fonctionnalite
# ou
git checkout -b fix/mon-correctif
```

### 3. Installer Pre-commit

```bash
./setup-precommit.sh
```

### 4. Développer

- Suivez les conventions de code du projet
- Ajoutez des tests pour vos changements
- Assurez-vous que tous les tests passent
- Utilisez les conventions de commit (voir [Types_de_commit.md](./doc/Types_de_commit.md))

### 5. Commit & Push

```bash
git add .
git commit -m "feat: ajouter fonctionnalité X"
# Les pre-commit hooks valideront automatiquement
git push origin feature/ma-fonctionnalite
```

### 6. Pull Request

- Créez une Pull Request sur GitHub
- Décrivez vos changements en détail
- Attendez la review et les retours

### Conventions de Commit

Nous utilisons le format [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]
```

**Types autorisés** : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Exemples** :
- `feat(auth): add password reset functionality`
- `fix(chat): resolve websocket connection issue`
- `docs: update installation instructions`

---

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE](./LICENSE) pour plus de détails.

---

## 👥 Équipe

Développé avec ❤️ dans le cadre du projet 42 School.

---

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/votre-username/matcha/issues)
- **Discussions** : [GitHub Discussions](https://github.com/votre-username/matcha/discussions)
- **Email** : support@matcha.com

---

## 🙏 Remerciements

- [42 School](https://www.42.fr/) pour le sujet du projet
- Tous les contributeurs qui ont participé au projet
- La communauté open-source pour les outils utilisés

---

<div align="center">

**⭐ Si ce projet vous plaît, n'hésitez pas à lui donner une étoile ! ⭐**

</div>
