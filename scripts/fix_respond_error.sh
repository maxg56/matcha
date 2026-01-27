#!/bin/bash

# Script to detect and report incorrect RespondError usage in match-service
# The match-service has parameters in wrong order: RespondError(c, message, statusCode)
# Should be: RespondError(c, statusCode, message)

set -e

echo "==================================="
echo "RespondError Usage Analysis"
echo "==================================="
echo ""

SERVICE_DIR="/home/user/matcha/api/match-service/src"

if [ ! -d "$SERVICE_DIR" ]; then
    echo "Error: match-service directory not found at $SERVICE_DIR"
    exit 1
fi

echo "Searching for RespondError calls in match-service..."
echo ""

# Find all Go files that call RespondError
FILES=$(grep -r "RespondError" "$SERVICE_DIR" --include="*.go" -l 2>/dev/null || true)

if [ -z "$FILES" ]; then
    echo "No RespondError calls found."
    exit 0
fi

echo "Files containing RespondError calls:"
echo "-----------------------------------"
echo "$FILES"
echo ""

echo "Detailed occurrences:"
echo "-----------------------------------"
grep -rn "RespondError" "$SERVICE_DIR" --include="*.go" --color=always

echo ""
echo "==================================="
echo "Summary"
echo "==================================="
TOTAL=$(grep -r "RespondError" "$SERVICE_DIR" --include="*.go" | wc -l)
echo "Total RespondError calls found: $TOTAL"
echo ""
echo "NOTE: match-service uses signature: RespondError(c, message, statusCode)"
echo "This should be changed to: RespondError(c, statusCode, message)"
echo ""
echo "To fix this issue:"
echo "1. Update utils/response.go to use correct parameter order"
echo "2. Update all handler files that call RespondError"
echo "3. Run tests to verify correctness"
echo ""
