# Notify-Service - Documentation

Ce service gère l'envoi de notifications en temps réel via WebSocket et leur stockage en base PostgreSQL. Il utilise FastAPI, Redis et PostgreSQL.

## Fonctionnement général
- Les notifications sont envoyées au backend via Redis (canal `notifications`).
- Lorsqu'un utilisateur se connecte au WebSocket, il reçoit ses notifications non lues depuis la base.
- Chaque notification reçue via Redis est enregistrée dans la base et envoyée en temps réel au client concerné si connecté.

## Fichiers principaux
- **main.py** : Point d'entrée FastAPI, expose les routes WebSocket et API, lance le listener Redis.
- **notification_manager.py** : Gère les connexions WebSocket, l'envoi des notifications, la récupération et suppression en base.
- **redis_listener.py** : Écoute le canal Redis, insère les notifications en base et les transmet aux clients connectés.
- **auth.py** : Authentifie les connexions WebSocket via JWT (token passé en query string).
- **db_connect.py** : Fournit la fonction de connexion PostgreSQL avec les variables d'environnement.
- **types.py** : Définit la classe Notification (structure des données échangées).
- **requirements.txt** : Dépendances Python nécessaires.
- **Dockerfile** : Image Docker pour lancer le service.

## Variables d'environnement
À définir dans le `.env` ou dans Docker :
- `DB_HOST` (défaut: postgres)
- `DB_PORT` (défaut: 5432)
- `DB_NAME` (défaut: matcha)
- `DB_USER` (défaut: postgres)
- `DB_PASSWORD` (défaut: password)
- `REDIS_HOST` (défaut: redis)
- `REDIS_PORT` (défaut: 6379)
- `REDIS_CHANNEL` (défaut: notifications)

## Format d'une notification
```json
{
  "to_user_id": 13,
  "notif_type": "2",
  "message": "Tu as reçu un like !"
}
```
- `notif_type` :
    - 0 = vue le profil
    - 1 = unlike
    - 2 = like
    - 3 = message
    - 4 = new match

## Commandes utiles

### Publier une notification dans Redis
```bash
docker exec -it matcha-redis-1 redis-cli -h redis -p 6379
publish notifications '{"to_user_id": 2, "notif_type": "0", "message": "on a vu ton profile !"}'
```

### Tester l'envoi via l'API
```bash
curl -X POST http://localhost:8005/api/v1/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"to_user_id": 7, "notif_type": "2", "message": "Tu as reçu un like ❤️"}'
```

### Connexion WebSocket côté frontend
```js
const ws = new WebSocket('wss://localhost:8443/ws/notifications?token=VOTRE_JWT');
ws.onmessage = (event) => {
  const notif = JSON.parse(event.data);
  // ...traitement de la notification
};
```

## Table PostgreSQL attendue
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  to_user_id INTEGER NOT NULL,
  notif_type VARCHAR(10) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Sécurité
- Le WebSocket nécessite un token JWT en query string (`?token=...`).
- Le backend ne vérifie pas la signature JWT (à adapter en prod).

## Dépendances
Voir `requirements.txt` pour la liste complète.
