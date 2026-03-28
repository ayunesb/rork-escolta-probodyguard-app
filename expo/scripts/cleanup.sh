#!/usr/bin/env bash
# Safe cleanup script. By default moves files to ./cleanup-backup/<timestamp>/
# Use --delete to permanently remove the files listed in cleanup.json

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
BACKUP_DIR="$ROOT_DIR/cleanup-backup/$(date -u +%Y%m%dT%H%M%SZ)"
DELETE=false

if [ "${1-}" = "--delete" ]; then
  DELETE=true
fi

echo "Project root: $ROOT_DIR"
echo "Reading cleanup.json..."

if [ ! -f "$ROOT_DIR/cleanup.json" ]; then
  echo "cleanup.json not found. Create it first or run the repo audit." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

# Counters
MOVED_COUNT=0
SKIPPED_COUNT=0
DELETED_COUNT=0
TOTAL_BYTES=0

jq -r '.items[].path' "$ROOT_DIR/cleanup.json" | while IFS= read -r path; do
  # normalize and avoid accidental absolute paths
  sanitized_path="$(echo "$path" | sed 's#^/##')"
  fullpath="$ROOT_DIR/$sanitized_path"

  if [ -e "$fullpath" ]; then
    if [ "$DELETE" = true ]; then
      echo "Deleting: $sanitized_path"
      # count bytes before deletion
      bytes=$(du -sb "$fullpath" | awk '{print $1}' || echo 0)
      rm -rf "$fullpath"
      DELETED_COUNT=$((DELETED_COUNT + 1))
      TOTAL_BYTES=$((TOTAL_BYTES + bytes))
    else
      echo "Moving $sanitized_path -> $BACKUP_DIR/"
      mkdir -p "$(dirname "$BACKUP_DIR/$sanitized_path")"
      # compute size before move
      bytes=$(du -sb "$fullpath" | awk '{print $1}' || echo 0)
      mv "$fullpath" "$BACKUP_DIR/$sanitized_path"
      MOVED_COUNT=$((MOVED_COUNT + 1))
      TOTAL_BYTES=$((TOTAL_BYTES + bytes))
    fi
  else
    echo "Not found (skipping): $sanitized_path"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
  fi
done

# Human-readable size
TOTAL_MB=$(awk "BEGIN {printf \"%.2f\", $TOTAL_BYTES/1024/1024}")

echo
if [ "$DELETE" = true ]; then
  echo "Deletion complete. Files deleted: $DELETED_COUNT. Total reclaimed: ${TOTAL_MB} MB"
else
  echo "Move complete. Files moved: $MOVED_COUNT. Files skipped: $SKIPPED_COUNT. Total moved size: ${TOTAL_MB} MB"
  echo "Backup dir: $BACKUP_DIR"
  echo "To permanently remove the backup, run: rm -rf '$BACKUP_DIR'"
fi

if [ "$DELETE" = true ]; then
  echo "Note: Deletion was permanent. Ensure you have backups if needed." >&2
fi
