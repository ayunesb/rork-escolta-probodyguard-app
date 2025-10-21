#!/usr/bin/env node

/**
 * Create Demo User Documents in Firestore
 * 
 * This script creates Firestore documents for all 6 demo accounts.
 * Run with: node scripts/create-demo-users.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Demo users configuration
const demoUsers = [
  {
    uid: 'qlDzWsluu1c9JOfmgUTV5amzaZu2', // client@demo.com UID
    email: 'client@demo.com',
    role: 'client',
    firstName: 'Demo',
    lastName: 'Client',
    phone: '+1234567890',
    kycStatus: 'approved'
  },
  {
    // You'll need to get the actual UIDs from Firebase Auth Console
    email: 'bodyguard@demo.com',
    role: 'bodyguard',
    firstName: 'Demo',
    lastName: 'Guard',
    phone: '+1234567891',
    kycStatus: 'approved'
  },
  {
    email: 'company@demo.com',
    role: 'company',
    firstName: 'Demo',
    lastName: 'Company',
    phone: '+1234567892',
    kycStatus: 'approved'
  },
  {
    email: 'admin@demo.com',
    role: 'admin',
    firstName: 'Demo',
    lastName: 'Admin',
    phone: '+1234567893',
    kycStatus: 'approved'
  },
  {
    email: 'guard1@demo.com',
    role: 'bodyguard',
    firstName: 'Guard',
    lastName: 'One',
    phone: '+1234567894',
    kycStatus: 'approved'
  },
  {
    email: 'guard2@demo.com',
    role: 'bodyguard',
    firstName: 'Guard',
    lastName: 'Two',
    phone: '+1234567895',
    kycStatus: 'approved'
  }
];

async function createDemoUsers() {
  console.log('🚀 Creating demo user documents in Firestore...\n');

  // First, get all UIDs from Firebase Auth
  const userRecords = await admin.auth().listUsers();
  const authUsers = {};
  userRecords.users.forEach(user => {
    if (user.email) {
      authUsers[user.email] = user.uid;
    }
  });

  let successCount = 0;
  let errorCount = 0;

  for (const userData of demoUsers) {
    const email = userData.email;
    const uid = userData.uid || authUsers[email];

    if (!uid) {
      console.log(`❌ ${email} - No Firebase Auth account found. Skipping.`);
      errorCount++;
      continue;
    }

    try {
      const now = new Date().toISOString();
      const userDoc = {
        email: email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        language: 'en',
        kycStatus: userData.kycStatus,
        createdAt: now,
        isActive: true,
        emailVerified: true, // Set to true for demo accounts
        updatedAt: now
      };

      await db.collection('users').doc(uid).set(userDoc);
      console.log(`✅ ${email} (${userData.role}) - Document created`);
      successCount++;
    } catch (error) {
      console.log(`❌ ${email} - Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Results: ${successCount} created, ${errorCount} failed`);
  process.exit(errorCount > 0 ? 1 : 0);
}

// Run the script
createDemoUsers().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
