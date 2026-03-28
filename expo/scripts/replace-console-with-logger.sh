#!/bin/bash
# Replace console.log with logger.log in service files
# Usage: ./scripts/replace-console-with-logger.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔧 Replacing console statements with logger in service files..."
echo "Project root: $PROJECT_ROOT"

# Files to process
FILES=(
  "services/paymentService.ts"
  "services/bookingService.ts"
  "services/ratingsService.ts"
  "services/emergencyService.ts"
  "services/searchService.ts"
)

TOTAL_REPLACED=0

for file in "${FILES[@]}"; do
  FILEPATH="$PROJECT_ROOT/$file"
  
  if [ ! -f "$FILEPATH" ]; then
    echo "⚠️  File not found: $file (skipping)"
    continue
  fi
  
  echo ""
  echo "📝 Processing: $file"
  
  # Count console statements before
  BEFORE=$(grep -c "console\.\(log\|warn\|error\|info\)" "$FILEPATH" || true)
  
  if [ "$BEFORE" -eq 0 ]; then
    echo "   ✅ No console statements found"
    continue
  fi
  
  # Create backup
  cp "$FILEPATH" "$FILEPATH.bak"
  
  # Replace console.log with logger.log
  sed -i '' 's/console\.log(/logger.log(/g' "$FILEPATH"
  sed -i '' 's/console\.warn(/logger.warn(/g' "$FILEPATH"
  sed -i '' 's/console\.error(/logger.error(/g' "$FILEPATH"
  sed -i '' 's/console\.info(/logger.info(/g' "$FILEPATH"
  sed -i '' 's/console\.debug(/logger.debug(/g' "$FILEPATH"
  
  # Count after
  AFTER=$(grep -c "console\.\(log\|warn\|error\|info\)" "$FILEPATH" || true)
  REPLACED=$((BEFORE - AFTER))
  TOTAL_REPLACED=$((TOTAL_REPLACED + REPLACED))
  
  echo "   ✅ Replaced $REPLACED console statements"
  
  # Remove backup if successful
  rm "$FILEPATH.bak"
done

echo ""
echo "✅ Complete! Replaced $TOTAL_REPLACED console statements total"
echo ""
echo "📋 Next steps:"
echo "   1. Review changes: git diff services/"
echo "   2. Test in development: npx expo start --dev-client"
echo "   3. Check for any linter errors"
echo "   4. Commit: git add . && git commit -m 'Phase 3: Replace console with logger in services'"
