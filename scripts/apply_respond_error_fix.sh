#!/bin/bash

# Script to automatically fix RespondError parameter order in match-service
# Changes RespondError(c, "message", http.StatusXXX) to RespondError(c, http.StatusXXX, "message")

set -e

SERVICE_DIR="/home/user/matcha/api/match-service/src"

echo "===================================="
echo "Fixing RespondError Parameter Order"
echo "===================================="
echo ""

# Files to fix (exclude utils/response.go as it's already fixed)
FILES=(
    "$SERVICE_DIR/handlers/profiles_handler.go"
    "$SERVICE_DIR/handlers/received_likes_handler.go"
    "$SERVICE_DIR/handlers/preferences_handler.go"
    "$SERVICE_DIR/handlers/interactions_handler.go"
    "$SERVICE_DIR/handlers/matches_handler.go"
)

for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "Warning: $file not found, skipping..."
        continue
    fi

    echo "Processing: $(basename $file)"

    # Create backup
    cp "$file" "$file.bak"

    # Use perl for more complex regex replacement
    # Pattern: RespondError(c, "...", http.StatusXXX)
    # Replace with: RespondError(c, http.StatusXXX, "...")
    perl -i -pe 's/utils\.RespondError\(c,\s*(".*?"),\s*(http\.Status\w+)\)/utils.RespondError(c, $2, $1)/g' "$file"

    # Handle concatenated strings like "message: "+err.Error()
    # Pattern: RespondError(c, "..."+..., http.StatusXXX)
    perl -i -pe 's/utils\.RespondError\(c,\s*(".*?"\+.*?),\s*(http\.Status\w+)\)/utils.RespondError(c, $2, $1)/g' "$file"

    echo "  ✓ Fixed"
done

echo ""
echo "===================================="
echo "Verification"
echo "===================================="
echo ""

# Show differences
for file in "${FILES[@]}"; do
    if [ -f "$file.bak" ]; then
        echo "Changes in $(basename $file):"
        diff -u "$file.bak" "$file" || true
        echo ""
    fi
done

echo "===================================="
echo "Cleanup"
echo "===================================="
echo ""
echo "Backup files created with .bak extension"
echo "To remove backups: rm $SERVICE_DIR/**/*.bak"
echo ""
echo "Done!"
