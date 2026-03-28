#!/usr/bin/env node
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin with emulator settings
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

const app = admin.initializeApp({
  projectId: 'escolta-pro-fe90e'
});

const db = getFirestore(app);

async function clearRateLimits() {
  console.log('Clearing rate limit records from Firestore...');
  
  try {
    // Get all documents in rateLimits collection
    const rateLimitsRef = db.collection('rateLimits');
    const snapshot = await rateLimitsRef.get();
    
    if (snapshot.empty) {
      console.log('No rate limit records found.');
      process.exit(0);
      return;
    }
    
    // Delete all rate limit documents
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    console.log(`✅ Cleared ${snapshot.size} rate limit records`);
    console.log('You can now test booking functionality without rate limits!');
    
  } catch (error) {
    console.error('❌ Error clearing rate limits:', error.message);
  }
  
  process.exit(0);
}

clearRateLimits().catch(console.error);