# 🚀 Guide de Configuration - Service Paiements

## 🛠️ Résolution du problème de permissions

Le message "permission denied" pour `/app/src/routes` indique un problème de permissions avec le hot reload d'Air dans Docker.

### Solution rapide :

```bash
# 1. Corriger les permissions
./fix-permissions.sh

# 2. Configurer les variables d'environnement
cp .env.example .env
# Puis éditer .env avec vos vraies clés Stripe

# 3. Redémarrer les services
make down
make
```

### Solution alternative (si le problème persiste) :

```bash
# Option 1: Lancer sans hot reload temporairement
docker compose -f docker-compose.dev.yml up paiements-service --build

# Option 2: Lancer en mode direct (sans Air)
cd api/paiements-service/src
go run main.go
```

## 🔧 Configuration Stripe requise

Ajoutez dans votre fichier `.env` :

```bash
# Clés Stripe (récupérables depuis votre dashboard Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MENSUEL=price_...  # ID du prix mensuel
STRIPE_PRICE_ANNUEL=price_...   # ID du prix annuel

# URLs de redirection
STRIPE_SUCCESS_URL=http://localhost:3000/payment-success
STRIPE_CANCEL_URL=http://localhost:3000/payment-cancel

# Clé pour la communication interne
INTERNAL_API_KEY=your-secure-internal-key
```

## 📡 Configuration des webhooks Stripe

1. **Dashboard Stripe** → Webhooks → Ajouter un endpoint
2. **URL** : `http://your-domain.com/api/stripe/webhook`
3. **Événements à écouter** :
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## 🧪 Test de fonctionnement

```bash
# Vérifier que le service démarre
curl http://localhost:8085/health

# Tester la création d'une session de checkout
curl -X POST http://localhost:8085/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"plan": "mensuel"}'

# Tester via le gateway (avec JWT)
curl -X GET http://localhost:8080/api/stripe/subscription \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔍 Diagnostic des problèmes

### Problème : "permission denied"
- **Cause** : Permissions Docker/Air
- **Solution** : `./fix-permissions.sh` puis `make restart`

### Problème : "database connection failed"
- **Cause** : PostgreSQL pas démarré
- **Solution** : `make` pour démarrer tous les services

### Problème : "webhook signature verification failed"
- **Cause** : `STRIPE_WEBHOOK_SECRET` incorrect
- **Solution** : Copier le secret depuis le dashboard Stripe

### Problème : "internal server error" sur les paiements
- **Cause** : Clés Stripe manquantes/incorrectes
- **Solution** : Vérifier `STRIPE_SECRET_KEY` et les prix IDs

## 📝 Structure des endpoints

```
Service Paiements (port 8085):
├── /health                              # Santé du service
├── /api/stripe/webhook                  # Webhooks Stripe
├── /api/stripe/create-checkout-session  # Création session
└── /api/stripe/
    ├── subscription/                    # Gestion abonnements (JWT)
    └── payment/                         # Historique paiements (JWT)

Gateway (port 8080):
└── /api/stripe/...                     # Proxy vers service paiements
```

## 🎯 Prochaines étapes

1. **Configuration Stripe** : Ajouter vos vraies clés
2. **Test paiements** : Utiliser les cartes de test Stripe
3. **Frontend** : Intégrer les endpoints dans votre UI
4. **Production** : Passer aux clés Stripe live

---

✅ **Le service paiements est maintenant prêt !**