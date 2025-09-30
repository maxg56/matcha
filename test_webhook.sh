#!/bin/bash

echo "=== Test du webhook service paiements ==="

# Test 1: Vérification de la santé
echo "1. Test de santé du service:"
docker exec matcha-paiements-service-1 wget -qO- http://localhost:8085/health || echo "Erreur de santé"

echo ""
echo "2. Test webhook simple:"
# Test 2: Webhook simple
docker exec matcha-paiements-service-1 sh -c '
cat > /tmp/simple_webhook.json << EOF
{}
EOF
wget -qO- --post-data="$(cat /tmp/simple_webhook.json)" --header="Content-Type: application/json" http://localhost:8085/api/stripe/test-webhook
' 2>/dev/null

echo ""
echo "3. Vérification des événements en DB:"
# Test 3: Vérifier les événements créés
docker exec matcha-postgres-1 psql -U postgres -d matcha_dev -c "SELECT id, stripe_event_id, event_type, processed, created_at FROM webhook_events ORDER BY created_at DESC LIMIT 5;" 2>/dev/null

echo ""
echo "4. Vérification des logs récents:"
docker logs matcha-paiements-service-1 --tail=10

echo ""
echo "=== Fin des tests ==="