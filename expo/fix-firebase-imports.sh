#!/bin/bash

# Script to fix Firebase imports across all service files

echo "Fixing Firebase imports..."

# Fix contexts/LocationTrackingContext.tsx
sed -i '' "s|from '@/config/firebase'|from '@/lib/firebase'|g" contexts/LocationTrackingContext.tsx
sed -i '' "s|realtimeDb|getRealtimeDb()|g" contexts/LocationTrackingContext.tsx

# Fix all service files
for file in services/*.ts; do
  echo "Processing $file..."
  sed -i '' "s|from '@/config/firebase'|from '@/lib/firebase'|g" "$file"
  sed -i '' "s|import { db }|import { db as getDbInstance }|g" "$file"
  sed -i '' "s|import { db, auth }|import { db as getDbInstance, auth as getAuthInstance }|g" "$file"
  sed -i '' "s|import { realtimeDb }|import { realtimeDb as getRealtimeDb }|g" "$file"
  sed -i '' "s|collection(db,|collection(getDbInstance(),|g" "$file"
  sed -i '' "s|doc(db,|doc(getDbInstance(),|g" "$file"
  sed -i '' "s|addDoc(collection(db,|addDoc(collection(getDbInstance(),|g" "$file"
  sed -i '' "s|ref(realtimeDb,|ref(getRealtimeDb(),|g" "$file"
  sed -i '' "s|auth.currentUser|getAuthInstance().currentUser|g" "$file"
done

echo "Done! All Firebase imports fixed."
