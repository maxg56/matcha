#!/bin/bash

# Test script for rewind availability endpoint
# This script assumes the match service is running on localhost:8003

BASE_URL="http://localhost:8003/api/v1/matches/premium/rewind"

# Test data - you'll need a valid JWT token for testing
# Replace with actual JWT token from your auth service
JWT_TOKEN="your-jwt-token-here"

echo "Testing Rewind Availability Endpoint..."
echo "========================================"

echo "1. Testing GET /availability (should return rewind availability)"
curl -X GET \
  "${BASE_URL}/availability" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo "2. Testing POST /perform (should perform rewind if available)"
curl -X POST \
  "${BASE_URL}/perform" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo "Testing completed!"