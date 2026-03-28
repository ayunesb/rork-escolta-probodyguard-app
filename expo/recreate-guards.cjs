#!/usr/bin/env node

/**
 * Delete and Recreate Guard Users
 * 
 * Since we can't reset passwords without email access,
 * this script will:
 * 1. Show you the guard UIDs to manually delete
 * 2. Then recreate them with correct password
 * 3. Restore their Firestore documents
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} = require('firebase/firestore');

// Firebase config
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

// Guard data from your Firebase Console screenshots
const GUARDS = [
  {
    oldUid: 'G8G0YUdi1eWIqtWZTVdSFT5scZl2',
    email: 'guard1@demo.com',
    password: 'Demo123!',
    firstName: 'Guard',
    lastName: 'One',
    phone: '+1234567894',
    role: 'bodyguard'
  },
  {
    oldUid: 'tuS4v80zBhgru0sUXXtFjilI7L2',
    email: 'guard2@demo.com',
    password: 'Demo123!',
    firstName: 'Guard',
    lastName: 'Two',
    phone: '+1234567895',
    role: 'bodyguard'
  }
];

async function recreateGuard(guardInfo) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`RECREATING: ${guardInfo.email}`);
  console.log('='.repeat(70));
  
  try {
    // Try to create the user
    console.log('\n📧 Step 1: Creating Firebase Auth account...');
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      guardInfo.email,
      guardInfo.password
    );
    
    const newUid = userCredential.user.uid;
    console.log(`✅ Account created successfully!`);
    console.log(`   Old UID: ${guardInfo.oldUid}`);
    console.log(`   New UID: ${newUid}`);
    console.log(`   Email: ${guardInfo.email}`);
    console.log(`   Password: ${guardInfo.password}`);
    
    // Create Firestore document
    console.log('\n📄 Step 2: Creating Firestore document...');
    const userDocRef = doc(db, 'users', newUid);
    
    await setDoc(userDocRef, {
      email: guardInfo.email,
      firstName: guardInfo.firstName,
      lastName: guardInfo.lastName,
      phone: guardInfo.phone,
      role: guardInfo.role,
      isActive: true,
      emailVerified: true,
      kycStatus: 'approved',
      language: 'en',
      availability: {
        monday: { available: true, hours: '09:00-17:00' },
        tuesday: { available: true, hours: '09:00-17:00' },
        wednesday: { available: true, hours: '09:00-17:00' },
        thursday: { available: true, hours: '09:00-17:00' },
        friday: { available: true, hours: '09:00-17:00' },
        saturday: { available: false },
        sunday: { available: false }
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    console.log('✅ Firestore document created!');
    console.log('   All fields set correctly');
    
    // Sign out
    await signOut(auth);
    
    // Test login
    console.log('\n🔐 Step 3: Testing login...');
    await signInWithEmailAndPassword(auth, guardInfo.email, guardInfo.password);
    console.log('✅ Login test successful!');
    await signOut(auth);
    
    return { 
      success: true, 
      email: guardInfo.email, 
      oldUid: guardInfo.oldUid,
      newUid,
      message: 'Account recreated successfully'
    };
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  Account already exists in Firebase Auth');
      console.log('\n📋 MANUAL ACTION REQUIRED:');
      console.log('   1. Go to Firebase Console: https://console.firebase.google.com/');
      console.log(`   2. Project: escolta-pro-fe90e`);
      console.log('   3. Authentication → Users');
      console.log(`   4. Find: ${guardInfo.email}`);
      console.log(`   5. Click the three dots (⋮) → Delete user`);
      console.log('   6. Confirm deletion');
      console.log('   7. Run this script again\n');
      
      return {
        success: false,
        email: guardInfo.email,
        needsManualDeletion: true,
        oldUid: guardInfo.oldUid,
        message: 'Needs manual deletion from Firebase Console'
      };
    }
    
    console.log(`❌ Error: ${error.message}`);
    console.log(`   Code: ${error.code}`);
    
    return {
      success: false,
      email: guardInfo.email,
      error: error.message,
      message: `Failed: ${error.code}`
    };
  }
}

async function main() {
  console.log('\n🔄 GUARD ACCOUNT RECREATION TOOL');
  console.log('==================================\n');
  console.log('Since we cannot reset passwords without email access,');
  console.log('this script will recreate the guard accounts with the correct password.\n');
  console.log('⚠️  NOTE: You may need to manually delete old accounts first!\n');
  
  const results = [];
  
  for (const guard of GUARDS) {
    const result = await recreateGuard(guard);
    results.push(result);
    
    // Pause between users
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70) + '\n');
  
  results.forEach(r => {
    console.log(`${r.success ? '✅' : '❌'} ${r.email}`);
    console.log(`   Status: ${r.message}`);
    if (r.oldUid) console.log(`   Old UID: ${r.oldUid}`);
    if (r.newUid) console.log(`   New UID: ${r.newUid}`);
    if (r.needsManualDeletion) {
      console.log(`   Action: Delete from Firebase Console first`);
    }
    console.log('');
  });
  
  const successCount = results.filter(r => r.success).length;
  const needsDeletion = results.filter(r => r.needsManualDeletion).length;
  
  console.log(`Result: ${successCount}/${results.length} accounts recreated\n`);
  
  if (successCount === results.length) {
    console.log('🎉 ALL GUARDS RECREATED SUCCESSFULLY!');
    console.log('\n✅ You can now login with:');
    console.log('   • guard1@demo.com / Demo123!');
    console.log('   • guard2@demo.com / Demo123!');
    console.log('\n📝 IMPORTANT: Old UIDs have changed!');
    console.log('   If you had any bookings assigned to old guard UIDs,');
    console.log('   they will need to be updated or recreated.');
    console.log('\nNext: Verify all users:');
    console.log('   node verify-complete-setup.cjs\n');
    
  } else if (needsDeletion > 0) {
    console.log('⚠️  MANUAL ACTION REQUIRED');
    console.log('\nTo complete the recreation:');
    console.log('1. Go to: https://console.firebase.google.com/');
    console.log('2. Project: escolta-pro-fe90e');
    console.log('3. Authentication → Users');
    console.log('4. Delete these accounts:\n');
    
    results.filter(r => r.needsManualDeletion).forEach(r => {
      console.log(`   • ${r.email} (UID: ${r.oldUid})`);
    });
    
    console.log('\n5. Run this script again: node recreate-guards.cjs\n');
    
  } else {
    console.log('❌ Some accounts could not be recreated');
    console.log('   Check errors above for details\n');
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
