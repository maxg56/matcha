# Documentation des Endpoints de Paiement - Architecture Finale

## Vue d'ensemble

Cette documentation présente l'architecture unifiée des fonctionnalités de paiement et premium après refactoring.

## Architecture Frontend

### Services Consolidés

#### 1. `paymentService.ts` - Gestion des abonnements Stripe
```typescript
// Endpoints utilisés
POST /api/v1/stripe/create-checkout-session
GET  /api/v1/stripe/subscription/status

// Types
PlanInterval: 'mensuel' | 'trimestriel' | 'annuel'
CreateCheckoutSessionRequest { plan, trialDays?, successUrl?, cancelUrl? }
SubscriptionStatus { has_subscription, status, plan, current_period_end, ... }
```

#### 2. `premiumService.ts` - Service unifié pour toutes les fonctionnalités premium
```typescript
// Délègue les paiements à paymentService
// Gère boost, rewind, matching premium, limites d'usage
// Endpoints appelés (À IMPLÉMENTER BACKEND):

// Boost
POST /api/v1/matches/premium/boost/start
GET  /api/v1/matches/premium/boost/current
POST /api/v1/matches/premium/boost/cancel

// Rewind (partiellement implémenté)
GET  /api/v1/matches/premium/rewind/availability
POST /api/v1/matches/premium/rewind/perform

// Premium Matching
GET  /api/v1/matches/premium/candidates
GET  /api/v1/matches/premium/who-likes-me
GET  /api/v1/matches/premium/limits
```

#### 3. `premiumStore.ts` - État global unifié
```typescript
// État simplifié avec nouveau service
PremiumStatus { isPremium, subscription, features }
BoostSession { id, boost_type, expires_at, is_active, ... }
RewindAvailability { can_rewind, expires_at, time_remaining, ... }
```

### Composants Consolidés

#### Composants supprimés (redondants)
- ❌ `frontend/src/components/settings/PremiumModal.tsx`
- ❌ `frontend/src/services/boostService.ts`
- ❌ `frontend/src/services/premiumMatchService.ts`

#### Composants conservés
- ✅ `frontend/src/components/premium/PremiumModal.tsx` (version avancée)
- ✅ `frontend/src/components/pricing/PricingCard.tsx`
- ✅ `frontend/src/pages/PricingPage.tsx`
- ✅ `frontend/src/types/pricing.ts` (unifié avec backend)

## Architecture Backend

### Services Existants

#### 1. Service Paiements (✅ IMPLÉMENTÉ)
```
api/paiements-service/
├── src/
│   ├── handlers/
│   │   ├── subscription.go     # GET /status, POST /create-checkout-session
│   │   └── webhook.go          # POST /webhook (Stripe events)
│   ├── models/
│   │   ├── subscription.go
│   │   ├── payment.go
│   │   └── stripe_event.go
│   └── conf/db.go

Endpoints gateway:
POST /api/v1/stripe/create-checkout-session
GET  /api/v1/stripe/subscription/status
POST /api/v1/stripe/webhook
```

#### 2. Service Match avec Rewind (⚠️ PARTIEL)
```
api/match-service/
├── src/
│   ├── services/rewind_service.go  # ✅ Logique rewind implémentée
│   └── models/rewind.go            # ✅ Modèle rewind

Endpoints existants:
Aucun endpoint exposé pour rewind dans gateway
```

### Services Manquants à Implémenter

#### 1. Endpoints Premium dans Match Service
```go
// À ajouter dans api/match-service/src/handlers/matches.go

// Boost endpoints
POST   /api/matches/premium/boost/start
GET    /api/matches/premium/boost/current
POST   /api/matches/premium/boost/cancel

// Rewind endpoints (utiliser service existant)
GET    /api/matches/premium/rewind/availability
POST   /api/matches/premium/rewind/perform

// Premium matching
GET    /api/matches/premium/candidates
GET    /api/matches/premium/who-likes-me
GET    /api/matches/premium/limits
```

#### 2. Routes Gateway Manquantes
```go
// À ajouter dans api/gateway/src/routes/match.go

premium := matches.Group("/premium")
premium.Use(middleware.JWTMiddleware())
{
    // Boost
    premium.POST("/boost/start", proxy.ProxyRequest("match", "/api/matches/premium/boost/start"))
    premium.GET("/boost/current", proxy.ProxyRequest("match", "/api/matches/premium/boost/current"))
    premium.POST("/boost/cancel", proxy.ProxyRequest("match", "/api/matches/premium/boost/cancel"))

    // Rewind
    premium.GET("/rewind/availability", proxy.ProxyRequest("match", "/api/matches/premium/rewind/availability"))
    premium.POST("/rewind/perform", proxy.ProxyRequest("match", "/api/matches/premium/rewind/perform"))

    // Premium matching
    premium.GET("/candidates", proxy.ProxyRequest("match", "/api/matches/premium/candidates"))
    premium.GET("/who-likes-me", proxy.ProxyRequest("match", "/api/matches/premium/who-likes-me"))
    premium.GET("/limits", proxy.ProxyRequest("match", "/api/matches/premium/limits"))
}
```

## Types de Données Unifiés

### Plans d'abonnement (Frontend ↔ Backend)
```typescript
// Frontend & Backend alignés
'mensuel'     → price_monthly_premium
'trimestriel' → price_quarterly_premium
'annuel'      → price_yearly_premium
```

### Statut Premium
```typescript
interface PremiumStatus {
  isPremium: boolean;
  subscription: SubscriptionStatus | null;
  features: {
    unlimitedSwipes: boolean;
    whoLikesMe: boolean;
    superLikes: number;        // -1 = unlimited
    boosts: number;            // monthly count
    rewinds: boolean;          // unlimited for premium
    unlimitedDistance: boolean;
    premiumChat: boolean;
  };
}
```

## Plan d'Implémentation Backend

### Étape 1: Ajouter les endpoints Rewind
```bash
# Dans api/match-service/src/handlers/matches.go
# Utiliser RewindService existant pour exposer:
GET  /api/matches/premium/rewind/availability
POST /api/matches/premium/rewind/perform
```

### Étape 2: Implémenter le système Boost
```bash
# Créer api/match-service/src/models/boost.go
# Créer api/match-service/src/services/boost_service.go
# Ajouter endpoints dans handlers/matches.go
```

### Étape 3: Premium Matching & Limites
```bash
# Étendre match_service.go pour premium features
# Ajouter logique unlimited distance, who-likes-me
# Système de limites par utilisateur
```

### Étape 4: Routes Gateway
```bash
# Ajouter toutes les routes premium dans gateway/routes/match.go
# Tester l'intégration frontend ↔ backend
```

## Tests Recommandés

### Frontend
```bash
cd frontend
pnpm test src/services/premiumService.test.ts
pnpm test src/stores/premiumStore.test.ts
```

### Backend
```bash
cd api/match-service
go test -v ./src/services -run TestRewind
go test -v ./src/handlers -run TestPremium
```

## État Actuel vs. Cible

### ✅ Complété
- Unification des services frontend
- Types alignés frontend/backend
- Service paiements opérationnel
- Modèles rewind backend

### ⚠️ À Faire
- Endpoints premium dans match-service
- Routes gateway pour premium features
- Système boost complet
- Tests d'intégration

### 📋 Priorités
1. **Critique**: Endpoints rewind (service existe déjà)
2. **Important**: Système boost pour profileboost
3. **Nice-to-have**: Premium matching avancé

---

Cette architecture élimine les redondances, unifie les types, et fournit une base solide pour l'extension des fonctionnalités premium.