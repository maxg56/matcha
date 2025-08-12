#!/bin/bash

# Test runner script for auth-service
set -euo pipefail

echo "🧪 Running Auth Service Tests"
echo "========================================="

cd "$(dirname "$0")"

# Set test environment
export JWT_SECRET="test-secret-key"
export JWT_REFRESH_SECRET="test-refresh-secret-key"
export JWT_ACCESS_TTL="15m"
export JWT_REFRESH_TTL="7d"

echo "📦 Ensuring dependencies are up to date..."
go mod tidy

echo "🔧 Building service..."
go build ./...

echo "🧪 Running tests..."
go test -v -race ./src

echo "📊 Running test coverage..."
go test -cover ./src

echo "✅ All tests completed successfully!"
