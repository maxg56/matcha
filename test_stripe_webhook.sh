#!/bin/bash

echo "=== Test d'un événement Stripe réel ==="

echo "Avant test - Nombre d'événements:"
docker exec matcha-postgres-1 psql -U postgres -d matcha_dev -c "SELECT COUNT(*) FROM webhook_events;" 2>/dev/null

echo ""
echo "Test d'un payment_intent.succeeded:"

# Créer un événement de test payment_intent.succeeded
docker exec matcha-paiements-service-1 wget -qO- --post-data='{"event_type":"payment_intent.succeeded","user_id":1,"amount":2999,"currency":"eur"}' --header="Content-Type: application/json" http://localhost:8085/api/stripe/test-webhook 2>/dev/null

echo ""
echo "Après test - Événements créés:"
docker exec matcha-postgres-1 psql -U postgres -d matcha_dev -c "SELECT id, stripe_event_id, event_type, processed, created_at FROM webhook_events ORDER BY created_at DESC LIMIT 3;" 2>/dev/null

echo ""
echo "Vérification des paiements créés:"
docker exec matcha-postgres-1 psql -U postgres -d matcha_dev -c "SELECT id, stripe_payment_id, amount, currency, status, created_at FROM payments ORDER BY created_at DESC LIMIT 3;" 2>/dev/null

echo ""
echo "=== Logs récents ==="
docker logs matcha-paiements-service-1 --tail=8