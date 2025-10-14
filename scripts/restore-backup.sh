#!/usr/bin/env bash
# restore-backup.sh <backup-timestamp> [path1 path2 ...]
# Example: ./scripts/restore-backup.sh 20251014T163037Z VERIFICATION_CHECKLIST.md
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
BACKUP_DIR="$ROOT_DIR/cleanup-backup/$1"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "Backup directory not found: $BACKUP_DIR"
  exit 1
fi

shift || true

if [ "$#" -eq 0 ]; then
  echo "No paths provided. Restoring entire backup..."
  echo "This will overwrite existing files in the project with files from the backup." 
  read -p "Proceed? (y/N): " confirm
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    rsync -av "$BACKUP_DIR/" "$ROOT_DIR/"
    echo "Restoration complete."
  else
    echo "Aborted.";
    exit 0
  fi
else
  for p in "$@"; do
    src="$BACKUP_DIR/$p"
    dst="$ROOT_DIR/$p"
    if [ -e "$src" ]; then
      mkdir -p "$(dirname "$dst")"
      mv "$src" "$dst"
      echo "Restored $p"
    else
      echo "Not found in backup: $p"
    fi
  done
fi
