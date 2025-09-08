# 💬 Chat Service

Service de messagerie temps réel pour l'application Matcha avec support WebSocket et architecture modulaire.

## 🏗️ Architecture

### Structure du projet

```
src/
├── conf/              # Configuration (DB, Redis)
├── connections/       # Gestionnaire de connexions (legacy)
├── handlers/          # Handlers HTTP et WebSocket
├── messaging/         # Publication de messages
├── middleware/        # Middlewares (auth, CORS)
├── models/           # Modèles de données (GORM)
├── repository/       # Couche d'accès aux données
├── services/         # Logique métier
├── types/           # Interfaces et types
├── utils/           # Utilitaires (réponses)
├── websocket/       # Gestion WebSocket temps réel
└── main.go         # Point d'entrée
```

### Architecture en couches

```
┌─────────────────┐
│   Handlers      │ ← HTTP/WebSocket endpoints
├─────────────────┤
│   Services      │ ← Logique métier
├─────────────────┤
│  Repository     │ ← Accès aux données
├─────────────────┤
│   Database      │ ← PostgreSQL + Redis
└─────────────────┘
```

## 🔧 Technologies

- **Go 1.21+** - Langage principal
- **Gin** - Framework web
- **GORM** - ORM pour PostgreSQL
- **Gorilla WebSocket** - WebSocket temps réel
- **Redis** - Cache et pub/sub
- **PostgreSQL** - Base de données principale

## 🚀 Démarrage rapide

### Prérequis

```bash
# Base de données
PostgreSQL >= 13
Redis >= 6

# Variables d'environnement
DB_HOST=localhost
DB_NAME=matcha_dev
DB_USER=postgres
DB_PASSWORD=password
REDIS_URL=localhost:6379
JWT_SECRET=your_secret_key
```

### Installation et démarrage

```bash
# Installer les dépendances
cd api/chat-service
go mod tidy

# Démarrer le service
cd src
go run main.go

# Ou compiler et exécuter
go build -o chat-service
./chat-service
```

Le service démarre sur le port **8004**.

## 📡 API Endpoints

### Authentification

Tous les endpoints nécessitent l'authentification JWT :

```http
Authorization: Bearer <jwt_token>
X-User-ID: <user_id>
```

### Conversations

#### Lister les conversations d'un utilisateur
```http
GET /api/v1/chat/conversations
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user1_id": 1,
      "user2_id": 2,
      "last_message_content": "Salut !",
      "last_message_at": "2023-12-07T15:30:00Z",
      "created_at": "2023-12-07T14:00:00Z"
    }
  ]
}
```

#### Récupérer une conversation
```http
GET /api/v1/chat/conversations/:conversationID
```

#### Créer une conversation
```http
POST /api/v1/chat/conversations
Content-Type: application/json

{
  "user_id": 2
}
```

### Messages

#### Récupérer les messages d'une conversation
```http
GET /api/v1/chat/conversations/:conversationID/messages?limit=50&offset=0
```

#### Envoyer un message (HTTP)
```http
POST /api/v1/chat/messages
Content-Type: application/json

{
  "conversation_id": 1,
  "message": "Salut, comment ça va ?"
}
```

#### Marquer les messages comme lus
```http
PUT /api/v1/chat/conversations/:conversationID/
```

## 🔌 WebSocket

### Connexion

```javascript
const ws = new WebSocket('ws://localhost:8004/api/v1/chat/ws');

// Headers d'authentification requis
ws.addEventListener('open', function() {
  // La connexion s'authentifie via les headers HTTP
  console.log('Connecté au chat');
});
```

### Types de messages

#### 1. Envoyer un message
```json
{
  "type": "send_message",
  "conversation_id": 1,
  "content": "Hello world!"
}
```

#### 2. Rejoindre une conversation
```json
{
  "type": "join_conversation",
  "conversation_id": 1
}
```

#### 3. Notification de frappe
```json
{
  "type": "typing",
  "conversation_id": 1,
  "is_typing": true
}
```

### Messages reçus

#### Nouveau message
```json
{
  "type": "new_message",
  "conversation_id": 1,
  "data": {
    "id": 123,
    "sender_id": 2,
    "message": "Hello!",
    "timestamp": "2023-12-07T15:30:00Z"
  }
}
```

#### Notification de frappe
```json
{
  "type": "typing",
  "conversation_id": 1,
  "data": {
    "user_id": 2,
    "is_typing": true
  }
}
```

#### Confirmation de connexion
```json
{
  "type": "connected",
  "data": {
    "user_id": 1,
    "status": "connected"
  }
}
```

## 🗄️ Base de données

### Tables principales

#### `discussion`
```sql
CREATE TABLE discussion (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    last_message_content TEXT,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `messages`
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conv_id INTEGER NOT NULL REFERENCES discussion(id),
    sender_id INTEGER NOT NULL,
    msg TEXT NOT NULL,
    time TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);
```

### Index recommandés

```sql
-- Pour les conversations d'un utilisateur
CREATE INDEX idx_discussion_users ON discussion(user1_id, user2_id);
CREATE INDEX idx_discussion_last_message ON discussion(last_message_at DESC);

-- Pour les messages d'une conversation
CREATE INDEX idx_messages_conv_id ON messages(conv_id, time DESC);
CREATE INDEX idx_messages_unread ON messages(conv_id, sender_id, read_at);
```

## 🛠️ Développement

### Structure des types

#### Interfaces principales

```go
type ChatService interface {
    GetUserConversations(userID uint) ([]models.Discussion, error)
    SendMessage(senderID, conversationID uint, content string) (*models.Message, error)
    // ...
}

type ChatRepository interface {
    GetMessages(conversationID uint, limit, offset int) ([]models.Message, error)
    SaveMessage(senderID, conversationID uint, content string) (*models.Message, error)
    // ...
}
```

### Ajouter un nouveau type de message WebSocket

1. **Définir le type** dans `websocket/types.go` :
```go
const MessageTypeCustom MessageType = "custom_action"
```

2. **Ajouter le handler** dans `websocket/connection.go` :
```go
func (c *Connection) handleMessage(msg IncomingMessage, chatService types.ChatService) error {
    switch msg.Type {
    case MessageTypeCustom:
        return c.handleCustomAction(msg, chatService)
    // ...
    }
}
```

3. **Implémenter la logique** :
```go
func (c *Connection) handleCustomAction(msg IncomingMessage, chatService types.ChatService) error {
    // Logique personnalisée
    return nil
}
```

### Tests

```bash
# Tests unitaires
go test ./...

# Tests avec coverage
go test -cover ./...

# Tests d'un package spécifique
go test -v ./services
```

## 📊 Monitoring et logs

### Logs structurés

```go
log.Printf("User %d connected, total: %d", userID, len(connections))
log.Printf("Message %d sent to conversation %d", messageID, conversationID)
```

### Métriques importantes

- **Connexions actives** - Nombre d'utilisateurs connectés
- **Messages par seconde** - Débit de messages
- **Latence WebSocket** - Temps de réponse
- **Erreurs de connexion** - Échecs d'authentification

## 🔒 Sécurité

### Authentification

- **JWT obligatoire** pour tous les endpoints
- **Validation utilisateur** via middleware
- **Vérification des permissions** pour chaque conversation

### WebSocket

- **Origin checking** en production
- **Rate limiting** sur les messages
- **Validation des payloads** JSON
- **Déconnexion automatique** des connexions inactives

### Base de données

- **Requêtes préparées** (GORM)
- **Validation des entrées**
- **Échappement automatique** des caractères spéciaux

## 🚨 Troubleshooting

### Problèmes courants

#### Service ne démarre pas
```bash
# Vérifier la base de données
psql -h localhost -U postgres -d matcha_dev -c "SELECT 1;"

# Vérifier Redis
redis-cli ping

# Logs du service
tail -f chat-service.log
```

#### WebSocket ne se connecte pas
```bash
# Tester la connexion
curl -H "X-User-ID: 1" http://localhost:8004/health

# Vérifier les headers d'authentification
# Authorization: Bearer <token>
# X-User-ID: <user_id>
```

#### Messages non reçus
```bash
# Vérifier Redis pub/sub
redis-cli monitor

# Logs des connexions WebSocket
grep "User.*connected" chat-service.log
```

### Variables d'environnement de debug

```bash
export GIN_MODE=debug           # Mode debug Gin
export LOG_LEVEL=debug          # Logs détaillés
export DB_LOG=true             # Logs SQL GORM
```

## 📈 Performance

### Optimisations

- **Connection pooling** PostgreSQL/Redis
- **Pagination** des messages (limit/offset)
- **Cleanup automatique** des connexions fermées
- **Broadcasting asynchrone** des messages

### Limites recommandées

- **Messages par conversation** : 1000 par page max
- **Connexions simultanées** : 10000 par instance
- **Taille des messages** : 1000 caractères max
- **Rate limiting** : 100 messages/minute par utilisateur

## 🤝 Contribution

1. **Fork** le repository
2. **Créer une branche** : `git checkout -b feature/nouvelle-fonctionnalite`
3. **Commit** : `git commit -m 'Ajout nouvelle fonctionnalité'`
4. **Push** : `git push origin feature/nouvelle-fonctionnalite`
5. **Pull Request** vers `main`

### Standards de code

- **Format** : `go fmt`
- **Lint** : `golangci-lint run`
- **Tests** : Coverage > 80%
- **Documentation** : Commentaires pour fonctions publiques

---

## 📞 Support

Pour toute question ou problème :
- **Issues GitHub** : Créer un ticket
- **Documentation** : Consulter le CLAUDE.md
- **Architecture** : Voir les diagrammes dans `/docs`