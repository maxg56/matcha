# Service WebSocket Unifié - Documentation

## Vue d'ensemble

Le service WebSocket unifié remplace les multiples connexions WebSocket par une seule connexion centralisée qui gère tous les types de messages (chat, notifications, etc.) via un système de routing intelligent.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │   Services      │
│                 │    │                  │    │                 │
│  Une connexion  │◄──►│  /ws (unified)   │◄──►│  Chat Service   │
│  WebSocket      │    │                  │    │  Notify Service │
│  + Routing      │    │  Message Router  │    │  etc...         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Utilisation

### 1. Connexion automatique

La connexion WebSocket est gérée automatiquement par le `WebSocketProvider` :

```tsx
// main.tsx
<WebSocketProvider>
  <App />
</WebSocketProvider>
```

### 2. Hook principal

```tsx
import { useWebSocketConnection } from '@/hooks/useWebSocketConnection';

function MyComponent() {
  const ws = useWebSocketConnection();
  
  // La connexion est automatique si l'utilisateur est authentifié
  return <div>WebSocket Status: {ws.isConnected() ? 'Connected' : 'Disconnected'}</div>;
}
```

### 3. Hooks spécialisés

#### Notifications
```tsx
import { useWebSocketNotifications } from '@/hooks/useWebSocketConnection';

function NotificationComponent() {
  const { markAsRead, markAllAsRead, addNotificationHandler } = useWebSocketNotifications();
  
  useEffect(() => {
    const handler = (data, message) => {
      console.log('Nouvelle notification:', data);
    };
    
    addNotificationHandler(handler);
    return () => removeNotificationHandler(handler);
  }, []);
  
  return (
    <button onClick={() => markAllAsRead()}>
      Marquer toutes comme lues
    </button>
  );
}
```

#### Chat
```tsx
import { useWebSocketChat } from '@/hooks/useWebSocketConnection';

function ChatComponent({ conversationId }) {
  const { sendMessage, addChatHandler } = useWebSocketChat(conversationId);
  
  useEffect(() => {
    const handler = (data, message) => {
      if (message.type === 'chat_message') {
        console.log('Nouveau message:', data);
      }
    };
    
    addChatHandler(handler);
    return () => removeChatHandler(handler);
  }, []);
  
  const handleSend = (text) => {
    sendMessage(conversationId, text);
  };
  
  return (
    <ChatInput onSendMessage={handleSend} />
  );
}
```

### 4. Service direct

Pour un contrôle avancé, utilisez directement le service :

```tsx
import { webSocketService, MessageType } from '@/services/websocket';

// Envoyer un message personnalisé
webSocketService.sendMessage({
  type: MessageType.CHAT,
  data: {
    conversation_id: "123",
    message: "Hello!"
  }
});

// Écouter des messages spécifiques
webSocketService.addMessageHandler('custom_type', (data, message) => {
  console.log('Message personnalisé:', data);
});

// Souscrire à un channel
webSocketService.subscribe('my-channel');
```

## Types de Messages

### Client vers Serveur
- `chat`: Messages de chat
- `notification`: Actions sur les notifications 
- `subscribe`: Souscription à un channel
- `unsubscribe`: Désouscription d'un channel
- `ping`: Maintien de connexion

### Serveur vers Client  
- `chat_message`: Nouveau message reçu
- `chat_ack`: Accusé de réception
- `notification_marked_read`: Notification marquée lue
- `connection_ack`: Connexion établie
- `error`: Message d'erreur

## Channels Prédéfinis

- `notifications`: Notifications générales
- `chat_{conversationId}`: Messages pour une conversation
- `user-updates`: Mises à jour utilisateur

## Gestion d'État

### Store Chat (Zustand)

```tsx
import { useChatStore } from '@/stores/chatStore';

function ChatPage() {
  const { 
    messages, 
    isConnected, 
    sendWebSocketMessage,
    subscribeToConversation 
  } = useChatStore();
  
  useEffect(() => {
    // Initialiser WebSocket pour le chat
    initializeWebSocket();
    
    // S'abonner à une conversation
    subscribeToConversation(123);
  }, []);
}
```

## Reconnexion Automatique

Le service gère automatiquement :
- Reconnexion en cas de perte de connexion
- Re-souscription aux channels après reconnexion
- Escalation exponentielle des tentatives
- Limite de tentatives (5 par défaut)

## Debug et Monitoring

### Composant de statut
```tsx
import { WebSocketStatus } from '@/components/WebSocketStatus';

// Afficher le statut WebSocket (dev uniquement)
{import.meta.env.DEV && <WebSocketStatus />}
```

### Logs
Tous les messages WebSocket sont loggés en mode développement avec :
- Connexion/déconnexion
- Messages envoyés/reçus
- Erreurs et reconnexions

## Configuration

### Variables d'environnement
```env
VITE_WS_HOST=localhost:8080    # Host WebSocket (par défaut: window.location.host)
```

### Timeouts et limites
```tsx
// Dans websocket.ts
private maxReconnectAttempts = 5;
private reconnectDelay = 1000; // ms
```

## Sécurité

- Authentification JWT automatique
- Validation des origins côté serveur
- Rate limiting par IP
- Nettoyage automatique des connexions inactives

## Migration depuis l'ancien système

### Avant (multiples WebSockets)
```tsx
// ❌ Ancien système
const notifWs = new WebSocket('/ws/notifications');
const chatWs = new WebSocket('/ws/chat');
```

### Après (WebSocket unifié)
```tsx
// ✅ Nouveau système
const { addNotificationHandler } = useWebSocketNotifications();
const { addChatHandler } = useWebSocketChat();
```

## Exemples Complets

### Page de Chat complète
Voir `ChatPageWebSocket.tsx` pour un exemple d'intégration complète avec :
- Gestion des messages temps réel
- Indicateurs de connexion
- Fallback sur HTTP si WebSocket indisponible
- UI responsive avec états de loading

### Notifications temps réel
Voir `NotifImage.ts` refactorisé pour un système de notifications unifié.

## Dépannage

### Problèmes courants

1. **WebSocket ne se connecte pas**
   - Vérifier l'authentification (token JWT)
   - Vérifier la configuration CORS côté serveur

2. **Messages non reçus**
   - Vérifier la souscription aux bons channels
   - Vérifier les handlers de messages

3. **Reconnexion échoue**
   - Vérifier la validité du token
   - Vérifier les logs serveur pour les erreurs

### Debug
```tsx
import { webSocketService } from '@/services/websocket';

// État de connexion
console.log(webSocketService.isConnected());
console.log(webSocketService.getConnectionState());

// Forcer reconnexion
webSocketService.connect();
```