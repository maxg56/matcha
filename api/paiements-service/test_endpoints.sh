#!/bin/bash

# Script de test pour vérifier les endpoints du service paiements
# Usage: ./test_endpoints.sh

BASE_URL="http://localhost:8085"

echo "🧪 Test des endpoints du service paiements"
echo "=============================================="

# Test 1: Health check
echo "📊 Test 1: Health check"
curl -s "${BASE_URL}/health" | jq . 2>/dev/null || echo "❌ Health check failed"
echo ""

# Test 2: Webhook Stripe (test)
echo "🔗 Test 2: Test webhook"
curl -s -X POST "${BASE_URL}/api/stripe/test-webhook" | jq . 2>/dev/null || echo "❌ Test webhook failed"
echo ""

# Test 3: Create checkout session (sans JWT)
echo "💳 Test 3: Create checkout session (legacy)"
curl -s -X POST "${BASE_URL}/api/stripe/create-checkout-session" \
  -H "Content-Type: application/json" \
  -d '{"plan": "mensuel"}' | jq . 2>/dev/null || echo "❌ Create checkout session failed"
echo ""

# Test 4: Get subscription (avec mock JWT)
echo "📋 Test 4: Get subscription (avec JWT mock)"
curl -s -X GET "${BASE_URL}/api/stripe/subscription" \
  -H "X-User-ID: 1" \
  -H "X-JWT-Token: mock-token" | jq . 2>/dev/null || echo "❌ Get subscription failed"
echo ""

# Test 5: Payment history (avec mock JWT)
echo "💰 Test 5: Payment history (avec JWT mock)"
curl -s -X GET "${BASE_URL}/api/stripe/payment/history" \
  -H "X-User-ID: 1" \
  -H "X-JWT-Token: mock-token" | jq . 2>/dev/null || echo "❌ Payment history failed"
echo ""

echo "✅ Tests terminés !"
echo ""
echo "⚠️  Note: Les tests qui échouent avec des erreurs de base de données sont normaux"
echo "   car le service n'est pas connecté à PostgreSQL en ce moment."