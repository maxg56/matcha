# Guide de Développement Matcha

Ce guide complet détaille toutes les procédures de développement pour le projet Matcha.

## Table des Matières

- [Configuration de l'Environnement](#configuration-de-lenvironnement)
- [Développement par Service](#développement-par-service)
- [Workflows Communs](#workflows-communs)
- [Tests](#tests)
- [Debugging](#debugging)
- [Qualité de Code](#qualité-de-code)
- [Git Workflow](#git-workflow)
- [Troubleshooting](#troubleshooting)

---

## Configuration de l'Environnement

### Prérequis

Vérifiez que vous avez les outils nécessaires :

```bash
# Docker & Docker Compose
docker --version          # >= 20.10
docker-compose --version  # >= 2.0

# Go (optionnel pour dev local)
go version               # >= 1.21

# Python (optionnel pour dev local)
python3 --version        # >= 3.11

# Node.js & pnpm (optionnel pour dev local)
node --version           # >= 18
pnpm --version           # >= 8

# Make
make --version
```

### Installation Initiale

#### 1. Cloner le Projet

```bash
git clone <repository-url>
cd matcha
```

#### 2. Configuration des Variables d'Environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Pour le développement, les valeurs par défaut fonctionnent
# Vous pouvez éditer .env pour personnaliser si nécessaire
nano .env
```

**Variables importantes pour le développement** :

```env
# Base de données
DB_HOST=postgres              # Nom du service Docker
DB_NAME=matcha_dev           # Base de données de dev
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=dev_secret_key    # Changez en production !

# Services URLs (pour communication inter-services)
AUTH_SERVICE_URL=http://auth-service:8001
USER_SERVICE_URL=http://user-service:8002
MATCH_SERVICE_URL=http://match-service:8003
CHAT_SERVICE_URL=http://chat-service:8004
NOTIFY_SERVICE_URL=http://notify-service:8005
MEDIA_SERVICE_URL=http://media-service:8006

# Auto-migration (dev only)
AUTO_MIGRATE=true            # Active les migrations GORM

# Frontend
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

#### 3. Pre-commit Hooks (Recommandé)

Les pre-commit hooks valident automatiquement votre code avant chaque commit.

```bash
# Pour distributions Linux standards
./setup-precommit.sh

# Pour Arch Linux
./setup-precommit-arch.sh

# Vérifier l'installation
pre-commit --version
```

**Hooks configurés** :
- Go : `go fmt`, `go vet`, `golangci-lint`
- Python : `black`, `isort`, `flake8`
- Frontend : `eslint`, `prettier`
- Général : `trailing-whitespace`, `end-of-file-fixer`

#### 4. Lancer l'Environnement Docker

```bash
# Lancer tous les services
make

# Ou manuellement
docker-compose -f docker-compose.dev.yml --env-file .env up -d

# Vérifier que tout est up
docker ps
```

**Services attendus** :
```
CONTAINER ID   IMAGE                    STATUS         PORTS
xxxxx          matcha-frontend         Up             0.0.0.0:3000->3000/tcp
xxxxx          matcha-gateway          Up             0.0.0.0:8080->8080/tcp
xxxxx          matcha-auth-service     Up             0.0.0.0:8001->8001/tcp
xxxxx          matcha-user-service     Up             0.0.0.0:8002->8002/tcp
xxxxx          matcha-match-service    Up             0.0.0.0:8003->8003/tcp
xxxxx          matcha-chat-service     Up             0.0.0.0:8004->8004/tcp
xxxxx          matcha-notify-service   Up             0.0.0.0:8005->8005/tcp
xxxxx          matcha-media-service    Up             0.0.0.0:8006->8006/tcp
xxxxx          matcha-postgres-1       Up             0.0.0.0:5432->5432/tcp
xxxxx          matcha-redis-1          Up             0.0.0.0:6379->6379/tcp
xxxxx          caddy-dev               Up             0.0.0.0:8000->80/tcp
```

#### 5. Vérifier l'Installation

```bash
# Health checks de tous les services
curl http://localhost:8080/health          # Gateway
curl http://localhost:8001/health          # Auth
curl http://localhost:8002/health          # User
curl http://localhost:8003/health          # Match
curl http://localhost:8004/health          # Chat
curl http://localhost:8005/health          # Notify
curl http://localhost:8006/health          # Media

# Frontend
curl http://localhost:3000                 # Devrait retourner HTML

# Application complète via Caddy
curl http://localhost:8000
```

---

## Développement par Service

### Services Go

Tous les services Go (gateway, auth-service, user-service, match-service, chat-service, paiements-service, user-creation) suivent la même structure.

#### Structure de Projet Go

```
api/<service-name>/
├── Dockerfile              # Image Docker du service
├── go.mod                  # Dépendances Go
├── go.sum                  # Checksums
├── README.md               # Doc spécifique
└── src/
    ├── main.go             # Point d'entrée
    ├── handlers/           # HTTP handlers
    ├── middleware/         # Middlewares
    ├── models/             # Modèles GORM
    ├── conf/               # Configuration (DB, Redis)
    ├── utils/              # Utilitaires
    └── types/              # Types custom
```

#### Développement Local (Go)

##### Option 1 : Avec Docker (Recommandé)

```bash
# Reconstruire après changements
docker-compose -f docker-compose.dev.yml --env-file .env up -d --build auth-service

# Voir les logs en temps réel
docker logs -f matcha-auth-service-1

# Redémarrer un service spécifique
docker restart matcha-auth-service-1
```

##### Option 2 : Run Local (sans Docker)

```bash
cd api/auth-service

# Installer les dépendances
go mod download

# Lancer le service
cd src
go run main.go

# Le service écoute sur le port défini (ex: 8001)
```

**⚠️ Important pour run local** :
- Assurez-vous que PostgreSQL et Redis sont accessibles
- Modifiez les variables d'environnement :
  ```bash
  export DB_HOST=localhost  # Au lieu de "postgres"
  export REDIS_HOST=localhost
  ```

#### Tests (Go)

```bash
cd api/auth-service/src

# Tous les tests
go test -v ./...

# Tests avec coverage
go test -v -cover ./...

# Coverage détaillé
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Test spécifique
go test -v . -run TestLogin

# Tests en mode verbose avec race detection
go test -v -race ./...
```

#### Script de Test Auth Service

L'auth-service possède un script de test complet :

```bash
cd api/auth-service
./test.sh
```

Ce script :
- Lance les tests unitaires
- Affiche la coverage
- Vérifie go vet
- Run golangci-lint

#### Hot Reload (Go) - Air

Certains services utilisent [Air](https://github.com/cosmtrek/air) pour le hot reload :

```bash
cd api/match-service

# Installer Air (si pas déjà installé)
go install github.com/cosmtrek/air@latest

# Lancer avec hot reload
air -c .air.toml
```

Configuration `.air.toml` :
```toml
[build]
  cmd = "go build -o ./tmp/main ./src"
  bin = "tmp/main"
  include_ext = ["go"]
  exclude_dir = ["tmp", "vendor"]
```

#### Build (Go)

```bash
cd api/auth-service/src

# Build de production
go build -o ../bin/auth-service

# Build optimisé (plus petit)
go build -ldflags="-s -w" -o ../bin/auth-service

# Cross-compilation (Linux)
GOOS=linux GOARCH=amd64 go build -o ../bin/auth-service-linux
```

#### Linting (Go)

```bash
cd api/auth-service

# go fmt (formattage)
go fmt ./...

# go vet (analyse statique)
go vet ./...

# golangci-lint (linter complet)
golangci-lint run

# Fixer automatiquement
golangci-lint run --fix
```

---

### Services Python

Services Python : notify-service, media-service

#### Structure de Projet Python

```
api/<service-name>/
├── Dockerfile              # Image Docker
├── requirements.txt        # Dépendances pip
├── README.md
└── src/
    ├── main.py             # Point d'entrée FastAPI
    ├── routers/            # Routes API
    ├── models/             # Modèles Pydantic
    ├── services/           # Logique métier
    ├── utils/              # Utilitaires
    └── tests/              # Tests pytest
```

#### Développement Local (Python)

##### Option 1 : Avec Docker

```bash
# Rebuild du service
docker-compose -f docker-compose.dev.yml --env-file .env up -d --build notify-service

# Logs
docker logs -f matcha-notify-service-1
```

##### Option 2 : Run Local

```bash
cd api/notify-service

# Créer un environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Lancer le service
cd src
python main.py

# Ou avec uvicorn (hot reload)
uvicorn main:app --reload --host 0.0.0.0 --port 8005
```

#### Tests (Python)

```bash
cd api/notify-service

# Activer venv si pas déjà fait
source venv/bin/activate

# Tous les tests
pytest

# Tests verbose
pytest -v

# Tests avec coverage
pytest --cov=src --cov-report=html

# Test spécifique
pytest tests/test_notifications.py::test_send_notification

# Tests avec output
pytest -s
```

#### Linting (Python)

```bash
cd api/notify-service
source venv/bin/activate

# Black (formattage)
black src/

# isort (import sorting)
isort src/

# flake8 (linting)
flake8 src/

# mypy (type checking)
mypy src/

# Tout en une commande
black src/ && isort src/ && flake8 src/
```

#### Hot Reload (Python)

FastAPI avec uvicorn supporte le hot reload nativement :

```bash
cd api/notify-service/src

# Mode développement avec auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8005
```

---

### Frontend (React)

#### Structure du Frontend

```
frontend/
├── Dockerfile
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts          # Configuration Vite
├── tsconfig.json           # Configuration TypeScript
├── tailwind.config.js      # Configuration Tailwind CSS
├── index.html
├── public/                 # Assets statiques
└── src/
    ├── main.tsx            # Point d'entrée
    ├── App.tsx             # Composant racine
    ├── pages/              # Pages (routes)
    │   ├── Home.tsx
    │   ├── Login.tsx
    │   ├── Profile.tsx
    │   └── Chat.tsx
    ├── components/         # Composants réutilisables
    │   ├── auth/
    │   ├── chat/
    │   ├── profile/
    │   └── common/
    ├── services/           # API clients
    │   ├── api.ts          # Config Axios
    │   ├── authService.ts
    │   ├── userService.ts
    │   └── chatService.ts
    ├── hooks/              # Custom hooks
    │   ├── useAuth.ts
    │   ├── useChat.ts
    │   └── useWebSocket.ts
    ├── store/              # Zustand stores
    │   ├── authStore.ts
    │   └── chatStore.ts
    ├── utils/              # Utilitaires
    ├── types/              # Types TypeScript
    └── styles/             # CSS global
```

#### Développement Local (Frontend)

```bash
cd frontend

# Installer les dépendances
pnpm install

# Mode développement (hot reload)
pnpm run dev
# → http://localhost:3000

# Build de production
pnpm run build

# Preview du build
pnpm run preview

# Linting
pnpm run lint

# Fix automatique
pnpm run lint:fix

# Type checking
pnpm run type-check

# Tests
pnpm test

# Tests avec UI
pnpm run test:ui

# Coverage
pnpm run test:coverage
```

#### Ajout d'une Nouvelle Page

```bash
cd frontend/src

# 1. Créer la page
cat > pages/NewPage.tsx << 'EOF'
import React from 'react';

const NewPage: React.FC = () => {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
};

export default NewPage;
EOF

# 2. Ajouter la route dans App.tsx
# Éditez App.tsx manuellement pour ajouter la route
```

#### Connexion aux APIs

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### WebSocket Chat

```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useState } from 'react';

export const useWebSocket = (url: string) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const websocket = new WebSocket(url);

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    setWs(websocket);

    return () => websocket.close();
  }, [url]);

  const sendMessage = (message: any) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  return { messages, sendMessage };
};
```

---

## Workflows Communs

### Démarrage Rapide du Projet

```bash
# 1. Tout démarrer
make

# 2. Vérifier que tout fonctionne
docker ps | grep matcha

# 3. Accéder à l'app
open http://localhost:8000
```

### Travailler sur un Service Spécifique

#### Workflow avec Docker (Recommandé)

```bash
# 1. Éditer le code dans api/<service>/src/

# 2. Rebuild et restart le service
docker-compose -f docker-compose.dev.yml up -d --build <service-name>

# 3. Voir les logs
docker logs -f matcha-<service-name>-1

# 4. Tester les changements
curl http://localhost:<port>/health
```

#### Workflow Local (Pour debug approfondi)

```bash
# 1. Arrêter le service Docker
docker stop matcha-auth-service-1

# 2. Lancer localement
cd api/auth-service/src
export DB_HOST=localhost
export REDIS_HOST=localhost
go run main.go

# 3. Debugger avec Delve (Go)
dlv debug main.go
```

### Créer un Nouveau Service

#### Service Go

```bash
# 1. Créer la structure
mkdir -p api/new-service/src
cd api/new-service

# 2. Initialiser le module Go
cat > go.mod << 'EOF'
module new-service

go 1.21

require (
    github.com/gorilla/mux v1.8.0
    gorm.io/gorm v1.25.0
    gorm.io/driver/postgres v1.5.0
)
EOF

# 3. Créer main.go
cat > src/main.go << 'EOF'
package main

import (
    "fmt"
    "log"
    "net/http"
    "github.com/gorilla/mux"
)

func main() {
    r := mux.NewRouter()

    r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        fmt.Fprintf(w, `{"status":"ok","service":"new-service"}`)
    }).Methods("GET")

    log.Println("New Service starting on :8009")
    log.Fatal(http.ListenAndServe(":8009", r))
}
EOF

# 4. Créer Dockerfile
cat > Dockerfile << 'EOF'
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY src/ ./src/
RUN go build -o /app/bin/new-service ./src

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/bin/new-service .
EXPOSE 8009
CMD ["./new-service"]
EOF

# 5. Ajouter dans docker-compose.dev.yml
# Éditez manuellement docker-compose.dev.yml

# 6. Tester
go mod tidy
cd src
go run main.go
```

---

## Tests

### Stratégie de Test

```
┌─────────────────────────────────────────┐
│         Pyramid de Tests                │
├─────────────────────────────────────────┤
│  E2E Tests          (Cypress)        ▲  │
│                                      │  │
│  Integration Tests  (API)           │  │
│                                    │  │
│  Unit Tests         (Go/Pytest)   │  │
│                                  │  │
└──────────────────────────────────▼─────┘
```

### Tests Unitaires

#### Go

```bash
cd api/auth-service/src

# Test d'une fonction spécifique
go test -v -run TestLogin

# Tous les tests du package
go test -v .

# Tous les tests récursivement
go test -v ./...

# Avec coverage
go test -cover ./...

# Coverage HTML
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html
open coverage.html
```

**Exemple de test** :
```go
// handlers/auth_test.go
package handlers

import (
    "testing"
    "net/http"
    "net/http/httptest"
)

func TestLogin(t *testing.T) {
    req := httptest.NewRequest("POST", "/api/v1/auth/login", nil)
    w := httptest.NewRecorder()

    Login(w, req)

    if w.Code != http.StatusOK {
        t.Errorf("Expected %d, got %d", http.StatusOK, w.Code)
    }
}
```

#### Python

```bash
cd api/notify-service

# Tous les tests
pytest

# Test spécifique
pytest tests/test_notifications.py

# Avec coverage
pytest --cov=src --cov-report=term-missing

# Coverage HTML
pytest --cov=src --cov-report=html
open htmlcov/index.html
```

**Exemple de test** :
```python
# tests/test_notifications.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_send_notification():
    response = client.post("/api/v1/notifications/send", json={
        "user_id": 1,
        "type": "like",
        "message": "Someone liked you!"
    })
    assert response.status_code == 200
    assert response.json()["success"] == True
```

#### Frontend

```bash
cd frontend

# Tous les tests
pnpm test

# Mode watch
pnpm test -- --watch

# Coverage
pnpm test -- --coverage

# Test spécifique
pnpm test -- Login.test.tsx
```

### Tests d'Intégration

#### Test d'un Flow Complet

```bash
#!/bin/bash
# test-auth-flow.sh

API_URL="http://localhost:8080"

# 1. Register
echo "Testing registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234!",
    "first_name": "Test",
    "last_name": "User",
    "birth_date": "1990-01-01",
    "gender": "male",
    "sex_pref": "female"
  }')

echo $REGISTER_RESPONSE | jq .

# 2. Login
echo "Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "testuser",
    "password": "Test1234!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.access_token')
echo "Token: $TOKEN"

# 3. Get Profile
echo "Testing get profile..."
curl -s -X GET "$API_URL/api/v1/users/profile" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 4. Logout
echo "Testing logout..."
curl -s -X POST "$API_URL/api/v1/auth/logout" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Debugging

### Logs Docker

```bash
# Logs d'un service
docker logs matcha-auth-service-1

# Logs temps réel
docker logs -f matcha-auth-service-1

# Dernières 100 lignes
docker logs --tail 100 matcha-auth-service-1

# Depuis une timestamp
docker logs --since 2023-01-01T00:00:00 matcha-auth-service-1

# Tous les services
docker-compose -f docker-compose.dev.yml logs -f
```

### Debug Go avec Delve

```bash
cd api/auth-service/src

# Installer Delve
go install github.com/go-delve/delve/cmd/dlv@latest

# Lancer en mode debug
dlv debug main.go

# Dans Delve
(dlv) break main.main
(dlv) continue
(dlv) print variableName
(dlv) next
(dlv) step
```

### Debug Python avec pdb

```python
# Ajouter dans le code
import pdb; pdb.set_trace()

# Ou avec breakpoint() (Python 3.7+)
breakpoint()
```

### Accès à la Base de Données

```bash
# Entrer dans PostgreSQL
docker exec -it matcha-postgres-1 psql -U postgres -d matcha_dev

# Commandes utiles
\dt                          # Lister les tables
\d users                     # Décrire table users
SELECT * FROM users;         # Query
\q                          # Quitter
```

### Accès à Redis

```bash
# Entrer dans Redis CLI
docker exec -it matcha-redis-1 redis-cli

# Commandes utiles
KEYS *                       # Lister toutes les clés
GET key_name                 # Obtenir une valeur
TTL key_name                 # Voir le TTL
DEL key_name                 # Supprimer une clé
FLUSHALL                     # DANGER: Vide tout Redis
```

### Inspecter les Requêtes HTTP

```bash
# Avec curl verbose
curl -v http://localhost:8080/api/v1/auth/login

# Avec HTTPie (plus lisible)
http POST localhost:8080/api/v1/auth/login login=test password=test

# Avec jq pour parser JSON
curl -s http://localhost:8080/api/v1/users/profile | jq .
```

---

## Qualité de Code

### Pre-commit Hooks

Les hooks sont automatiquement exécutés avant chaque commit :

```bash
# Run manuellement
pre-commit run --all-files

# Skip hooks (à éviter!)
git commit --no-verify

# Mettre à jour les hooks
pre-commit autoupdate
```

### Linting

#### Go (golangci-lint)

```bash
cd api/auth-service

# Installer golangci-lint
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Lancer tous les linters
golangci-lint run

# Fixer automatiquement
golangci-lint run --fix

# Linters spécifiques
golangci-lint run --disable-all --enable=errcheck
```

#### Python (flake8 + black + isort)

```bash
cd api/notify-service

# Black (formattage)
black src/
black --check src/  # Vérifier sans modifier

# isort (imports)
isort src/
isort --check-only src/

# flake8 (linting)
flake8 src/

# Tout ensemble
black src/ && isort src/ && flake8 src/
```

#### Frontend (ESLint + Prettier)

```bash
cd frontend

# ESLint
pnpm run lint
pnpm run lint:fix

# Prettier
pnpm run format
pnpm run format:check

# TypeScript check
pnpm run type-check
```

### Code Review Checklist

Avant de soumettre une PR, vérifiez :

- [ ] Tous les tests passent
- [ ] Coverage maintenu ou amélioré
- [ ] Linters passent sans erreurs
- [ ] Code formaté correctement
- [ ] Documentation à jour
- [ ] Pas de secrets/credentials dans le code
- [ ] Variables d'environnement documentées
- [ ] Logs appropriés ajoutés
- [ ] Messages d'erreur clairs
- [ ] Gestion des erreurs robuste

---

## Git Workflow

### Conventions de Commit

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types** :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation seulement
- `style`: Formatage (pas de changement de code)
- `refactor`: Refactoring de code
- `test`: Ajout/modification de tests
- `chore`: Maintenance (deps, config, etc.)

**Exemples** :
```bash
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(chat): resolve websocket connection issue"
git commit -m "docs: update installation instructions"
git commit -m "refactor(user): simplify profile update logic"
git commit -m "test(match): add unit tests for algorithm"
```

### Workflow de Branche

```bash
# 1. Créer une branche depuis main
git checkout main
git pull origin main
git checkout -b feature/my-feature

# 2. Développer
# ... faire vos changements ...

# 3. Commit réguliers
git add .
git commit -m "feat(scope): add feature X"

# 4. Synchroniser avec main
git fetch origin
git rebase origin/main

# 5. Push
git push origin feature/my-feature

# 6. Créer une Pull Request sur GitHub
```

### Pull Request

**Template de PR** :

```markdown
## Description
Brève description des changements

## Type de changement
- [ ] Nouvelle fonctionnalité (feat)
- [ ] Correction de bug (fix)
- [ ] Refactoring
- [ ] Documentation

## Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration passent
- [ ] Tests manuels effectués

## Checklist
- [ ] Code suit les conventions du projet
- [ ] Documentation mise à jour
- [ ] Pas de breaking changes (ou documentés)
- [ ] Pre-commit hooks passent
```

---

## Troubleshooting

### Problèmes Courants

#### "Cannot connect to database"

```bash
# Vérifier que PostgreSQL est up
docker ps | grep postgres

# Vérifier les logs
docker logs matcha-postgres-1

# Restart
docker restart matcha-postgres-1

# Vérifier les variables d'env
echo $DB_HOST  # Doit être "postgres" dans Docker
```

#### "Redis connection refused"

```bash
# Vérifier Redis
docker ps | grep redis

# Logs
docker logs matcha-redis-1

# Test de connexion
docker exec -it matcha-redis-1 redis-cli ping
# Doit retourner: PONG
```

#### "Port already in use"

```bash
# Trouver le process qui utilise le port
lsof -i :8080

# Tuer le process
kill -9 <PID>

# Ou changer le port dans docker-compose.dev.yml
```

#### "Module not found" (Go)

```bash
cd api/<service>

# Nettoyer et réinstaller
go clean -modcache
go mod download
go mod tidy
```

#### "Permission denied" (Docker volumes)

```bash
# Changer les permissions
sudo chown -R $USER:$USER volumes/

# Ou recréer les volumes
make down
sudo rm -rf volumes/
make
```

#### Pre-commit Hooks Échecs

```bash
# Go fmt failed
cd api/<service>
go fmt ./...

# Black failed
cd api/<service>
black src/

# ESLint failed
cd frontend
pnpm run lint:fix

# Skip hooks temporairement (déconseillé)
git commit --no-verify
```

### Réinitialiser l'Environnement

```bash
# Tout arrêter et nettoyer
make down

# Supprimer les volumes (⚠️ perte de données)
sudo rm -rf volumes/

# Nettoyer les images Docker
docker system prune -a

# Redémarrer de zéro
make
```

### Debug Réseau Docker

```bash
# Lister les réseaux
docker network ls

# Inspecter un réseau
docker network inspect matcha_backend

# Tester la connectivité entre services
docker exec matcha-gateway-1 ping auth-service
docker exec matcha-auth-service-1 ping postgres
```

---

## Ressources

### Documentation Officielle

- [Go Documentation](https://go.dev/doc/)
- [Python FastAPI](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

### Outils Utiles

- [Postman](https://www.postman.com/) - Test d'APIs
- [TablePlus](https://tableplus.com/) - Client DB
- [RedisInsight](https://redis.com/redis-enterprise/redis-insight/) - Redis GUI
- [VS Code](https://code.visualstudio.com/) - IDE
- [GoLand](https://www.jetbrains.com/go/) - Go IDE

### Extensions VS Code Recommandées

```json
{
  "recommendations": [
    "golang.go",
    "ms-python.python",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-azuretools.vscode-docker"
  ]
}
```

---

**Dernière mise à jour** : 2025-11-21

Pour toute question, consultez [README.md](./README.md) ou [ARCHITECTURE.md](./ARCHITECTURE.md).
