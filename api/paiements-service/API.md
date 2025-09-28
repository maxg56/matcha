# Payment Service API Documentation

## Overview
The Payment Service handles Stripe-based subscription payments for the Matcha dating app.

## Architecture
- **Framework**: Gin (Go)
- **Database**: PostgreSQL with GORM
- **Authentication**: JWT via gateway headers
- **Payment Provider**: Stripe

## Endpoints

### Protected Endpoints (Require Authentication)

#### POST /api/stripe/create-checkout-session
Creates a Stripe checkout session for subscription.

**Request Body:**
```json
{
  "plan": "mensuel" | "annuel"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "cs_...",
    "url": "https://checkout.stripe.com/..."
  }
}
```

#### GET /api/stripe/subscription/status
Get current subscription status for authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "has_subscription": true,
    "status": "active",
    "plan": "mensuel",
    "current_period_end": "2024-12-31T23:59:59Z",
    "cancel_at_period_end": false,
    "is_active": true
  }
}
```

### Public Endpoints

#### POST /api/stripe/webhook
Stripe webhook endpoint for processing payment events.

**Headers:**
- `Stripe-Signature`: Webhook signature for verification

**Events Handled:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Database Models

### Subscriptions
- User subscription tracking
- Stripe subscription mapping
- Status and period management

### Payments
- Payment transaction records
- Stripe payment intent/charge tracking
- Amount and status tracking

### Stripe Events
- Webhook event deduplication
- Event processing status
- Audit trail for payments

## Environment Variables

### Required
- `STRIPE_SECRET_KEY`: Stripe secret API key
- `STRIPE_PRICE_MENSUEL`: Monthly subscription price ID
- `STRIPE_PRICE_ANNUEL`: Annual subscription price ID
- `STRIPE_WEBHOOK_SECRET`: Webhook endpoint secret

### Optional
- `PAYOUT_SERVICE_PORT`: Service port (default: 8085)
- `FRONTEND_URL`: Frontend URL for redirects (default: http://localhost:3000)
- `CORS_ALLOWED_ORIGINS`: Comma-separated allowed origins
- `GIN_MODE`: Gin mode (release/debug)

### Database
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `AUTO_MIGRATE`: Enable auto-migration (true/false)

## Security Features

### Authentication
- JWT token validation via gateway headers
- User ID extraction from `X-User-ID` header
- Protected endpoints require authentication

### Webhook Security
- Stripe signature verification
- Event idempotency handling
- Secure webhook secret validation

### Data Protection
- Sensitive payment data stored securely
- PCI compliance through Stripe
- No credit card data stored locally

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (authentication required)
- `409`: Conflict (duplicate subscription)
- `500`: Internal Server Error

## Development

### Local Setup
```bash
cd api/paiements-service
go mod tidy
go run src/main.go
```

### With Docker
```bash
docker-compose -f docker-compose.dev.yml up paiements-service
```

### Hot Reload
```bash
air -c .air.toml
```

## Testing

### Build Test
```bash
go build -o tmp/paiements-service ./src
```

### Webhook Testing
Use Stripe CLI for webhook testing:
```bash
stripe listen --forward-to localhost:8085/api/stripe/webhook
```
### **Cartes de test classiques**

| Type             | Numéro de carte     | Expiration | CVC       | Résultat attendu |
| ---------------- | ------------------- | ---------- | --------- | ---------------- |
| Visa             | 4242 4242 4242 4242 | n’importe  | n’importe | Paiement réussi  |
| Mastercard       | 5555 5555 5555 4444 | n’importe  | n’importe | Paiement réussi  |
| American Express | 3782 822463 10005   | n’importe  | n’importe | Paiement réussi  |
| Diners Club      | 3056 930902 5904    | n’importe  | n’importe | Paiement réussi  |
| Discover         | 6011 1111 1111 1117 | n’importe  | n’importe | Paiement réussi  |
| JCB              | 3566 1111 1111 1113 | n’importe  | n’importe | Paiement réussi  |

---

### **Cartes pour simuler des erreurs**

| Numéro de carte     | Expiration | CVC       | Résultat                                        |
| ------------------- | ---------- | --------- | ----------------------------------------------- |
| 4000 0000 0000 0002 | n’importe  | n’importe | Carte refusée                                   |
| 4000 0000 0000 9995 | n’importe  | n’importe | Solde insuffisant                               |
| 4000 0000 0000 0069 | n’importe  | n’importe | Paiement nécessite authentification (3D Secure) |
