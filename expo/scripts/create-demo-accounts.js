#!/usr/bin/env node
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin with emulator settings
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

const app = admin.initializeApp({
  projectId: 'escolta-pro-fe90e'
});

const auth = getAuth(app);
const db = getFirestore(app);

const demoAccounts = [
  {
    email: 'client@demo.com',
    password: '<contrasena en tu .env local, no en el repositorio>',
    userData: {
      email: 'client@demo.com',
      role: 'client',
      firstName: 'Demo',
      lastName: 'Client',
      phone: '+1-555-0101',
      language: 'en',
      kycStatus: 'approved',
      createdAt: new Date().toISOString()
    }
  },
  {
    email: 'guard1@demo.com',
    password: '<contrasena en tu .env local, no en el repositorio>',
    userData: {
      email: 'guard1@demo.com',
      role: 'guard',
      firstName: 'Demo',
      lastName: 'Guard',
      phone: '+1-555-0102',
      language: 'en',
      kycStatus: 'approved',
      createdAt: new Date().toISOString(),
      availability: 'available',
      rating: 4.8,
      experience: '5+ years',
      specializations: ['executive_protection', 'event_security']
    }
  },
  {
    email: 'company@demo.com',
    password: '<contrasena en tu .env local, no en el repositorio>',
    userData: {
      email: 'company@demo.com',
      role: 'company',
      firstName: 'Demo',
      lastName: 'Company',
      phone: '+1-555-0103',
      language: 'en',
      kycStatus: 'approved',
      createdAt: new Date().toISOString(),
      companyName: 'Demo Security Company',
      guards: []
    }
  },
  {
    email: 'admin@demo.com',
    password: '<contrasena en tu .env local, no en el repositorio>',
    userData: {
      email: 'admin@demo.com',
      role: 'admin',
      firstName: 'Demo',
      lastName: 'Admin',
      phone: '+1-555-0104',
      language: 'en',
      kycStatus: 'approved',
      createdAt: new Date().toISOString()
    }
  }
];

async function createDemoAccounts() {
  console.log('Creating demo accounts...');
  
  for (const account of demoAccounts) {
    try {
      // Create auth user
      const userRecord = await auth.createUser({
        email: account.email,
        password: account.password,
        emailVerified: true
      });
      
      console.log(`✅ Created auth user: ${account.email} (UID: ${userRecord.uid})`);
      
      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set(account.userData);
      console.log(`✅ Created user document for: ${account.email}`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️  User already exists: ${account.email}`);
      } else {
        console.error(`❌ Error creating ${account.email}:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 Demo accounts setup complete!');
  console.log('\nYou can now log in with:');
  console.log('• Client: client@demo.com / <contrasena en tu .env local, no en el repositorio>');
  console.log('• Guard: guard1@demo.com / <contrasena en tu .env local, no en el repositorio>');
  console.log('• Company: company@demo.com / <contrasena en tu .env local, no en el repositorio>');
  console.log('• Admin: admin@demo.com / <contrasena en tu .env local, no en el repositorio>');
  
  process.exit(0);
}

createDemoAccounts().catch(console.error);