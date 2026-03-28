#!/usr/bin/env node

/**
 * Reset Guard Passwords Tool
 * 
 * This script will:
 * 1. Try to sign in to each guard account
 * 2. If auth/user-not-found: Create the account
 * 3. If auth/wrong-password: Can't fix (need Firebase Console)
 * 4. If successful: Account already works
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} = require('firebase/firestore');

// Firebase config from environment
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const GUARD_USERS = [
  { 
    email: 'guard1@demo.com', 
    password: 'Demo123!',
    firstName: 'Guard',
    lastName: 'One',
    phone: '+1234567801'
  },
  { 
    email: 'guard2@demo.com', 
    password: 'Demo123!',
    firstName: 'Guard',
    lastName: 'Two',
    phone: '+1234567802'
  },
];

async function setupGuardAccount(guardInfo) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing: ${guardInfo.email}`);
  console.log('='.repeat(60));
  
  try {
    // First, try to sign in
    console.log('📧 Step 1: Attempting to sign in...');
    const userCredential = await signInWithEmailAndPassword(
      auth,
      guardInfo.email,
      guardInfo.password
    );
    
    console.log(`✅ Account already exists and password is correct!`);
    console.log(`   UID: ${userCredential.user.uid}`);
    
    // Check if Firestore document exists
    console.log('\n📄 Step 2: Checking Firestore document...');
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    
    // Create/update Firestore document
    await setDoc(userDocRef, {
      email: guardInfo.email,
      firstName: guardInfo.firstName,
      lastName: guardInfo.lastName,
      phone: guardInfo.phone,
      role: 'guard',
      isActive: true,
      emailVerified: true,
      kycStatus: 'approved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    console.log('✅ Firestore document updated!');
    
    await signOut(auth);
    return { success: true, uid: userCredential.user.uid };
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('⚠️  User does not exist. Creating account...');
      
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          guardInfo.email,
          guardInfo.password
        );
        
        console.log(`✅ Account created successfully!`);
        console.log(`   UID: ${userCredential.user.uid}`);
        
        // Create Firestore document
        console.log('\n📄 Creating Firestore document...');
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        
        await setDoc(userDocRef, {
          email: guardInfo.email,
          firstName: guardInfo.firstName,
          lastName: guardInfo.lastName,
          phone: guardInfo.phone,
          role: 'guard',
          isActive: true,
          emailVerified: true,
          kycStatus: 'approved',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        console.log('✅ Firestore document created!');
        
        await signOut(auth);
        return { success: true, uid: userCredential.user.uid, created: true };
        
      } catch (createError) {
        console.error('❌ Error creating account:', createError.message);
        return { success: false, error: createError.message };
      }
      
    } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      console.log('❌ Wrong password or account locked');
      console.log('   Current password in script: Demo123!');
      console.log('   Solutions:');
      console.log('   1. Go to Firebase Console → Authentication → Users');
      console.log(`   2. Find ${guardInfo.email}`);
      console.log('   3. Reset password to: Demo123!');
      console.log('   4. OR delete the user and run this script again');
      return { success: false, error: 'Wrong password - needs manual reset' };
      
    } else if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  Email already in use but password is wrong');
      console.log('   This means the account exists but password does not match Demo123!');
      console.log('   You need to reset the password in Firebase Console');
      return { success: false, error: 'Email exists with different password' };
      
    } else {
      console.error('❌ Unexpected error:', error.message);
      console.error('   Code:', error.code);
      return { success: false, error: error.message };
    }
  }
}

async function main() {
  console.log('\n🔐 GUARD PASSWORD RESET TOOL');
  console.log('================================\n');
  console.log('This will ensure guard accounts are set up with password: Demo123!\n');
  
  const results = [];
  
  for (const guard of GUARD_USERS) {
    const result = await setupGuardAccount(guard);
    results.push({ email: guard.email, ...result });
  }
  
  // Final summary
  console.log('\n\n' + '='.repeat(60));
  console.log('FINAL SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  results.forEach(r => {
    if (r.success) {
      const status = r.created ? 'CREATED' : 'VERIFIED';
      console.log(`✅ ${status} - ${r.email}`);
      console.log(`   UID: ${r.uid}\n`);
    } else {
      console.log(`❌ FAILED - ${r.email}`);
      console.log(`   Error: ${r.error}\n`);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\nResult: ${successCount}/${results.length} guards working\n`);
  
  if (successCount < results.length) {
    console.log('⚠️  MANUAL ACTION REQUIRED:');
    console.log('   Go to: https://console.firebase.google.com/');
    console.log('   → Select project: escolta-pro-fe90e');
    console.log('   → Authentication → Users');
    console.log('   → Find the failed accounts and reset passwords to: Demo123!');
    console.log('   → Then run this script again\n');
  } else {
    console.log('✅ All guard accounts are ready!');
    console.log('   You can now login with:');
    console.log('   - guard1@demo.com / Demo123!');
    console.log('   - guard2@demo.com / Demo123!\n');
  }
}

main()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
