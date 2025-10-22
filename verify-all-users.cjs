require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

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

const DEMO_USERS = [
  { email: 'client@demo.com', password: 'Demo123!', expectedRole: 'client' },
  { email: 'guard1@demo.com', password: 'Demo123!', expectedRole: 'guard' },
  { email: 'guard2@demo.com', password: 'Demo123!', expectedRole: 'guard' },
];

async function verifyUser(email, password, expectedRole) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${email}`);
  console.log('='.repeat(60));
  
  try {
    // Step 1: Test Authentication
    console.log('📧 Step 1: Testing Firebase Authentication...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Authentication successful!');
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email verified: ${user.emailVerified}`);
    
    // Step 2: Check Firestore Document
    console.log('\n📄 Step 2: Checking Firestore user document...');
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('❌ User document does NOT exist in Firestore!');
      console.log(`   Expected document at: users/${user.uid}`);
      console.log('   This will cause permission errors.');
      return {
        email,
        uid: user.uid,
        authWorks: true,
        firestoreExists: false,
        roleCorrect: false,
        issues: ['Missing Firestore document']
      };
    }
    
    console.log('✅ Firestore document exists!');
    const userData = userDoc.data();
    console.log(`   Document data:`, JSON.stringify(userData, null, 2));
    
    // Step 3: Verify Role
    console.log('\n👤 Step 3: Verifying user role...');
    if (userData.role === expectedRole) {
      console.log(`✅ Role correct: ${userData.role}`);
    } else {
      console.log(`❌ Role mismatch!`);
      console.log(`   Expected: ${expectedRole}`);
      console.log(`   Actual: ${userData.role || 'MISSING'}`);
    }
    
    // Step 4: Check Required Fields
    console.log('\n🔍 Step 4: Checking required fields...');
    const requiredFields = ['email', 'role', 'createdAt'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ All required fields present');
    } else {
      console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`);
    }
    
    // Summary
    const issues = [];
    if (userData.role !== expectedRole) issues.push(`Wrong role: ${userData.role}`);
    if (missingFields.length > 0) issues.push(`Missing fields: ${missingFields.join(', ')}`);
    if (!user.emailVerified) issues.push('Email not verified');
    
    console.log('\n📊 Summary:');
    if (issues.length === 0) {
      console.log('✅ ALL CHECKS PASSED - User is fully working!');
    } else {
      console.log('⚠️  Issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    // Sign out before next test
    await signOut(auth);
    
    return {
      email,
      uid: user.uid,
      authWorks: true,
      firestoreExists: true,
      roleCorrect: userData.role === expectedRole,
      emailVerified: user.emailVerified,
      userData,
      issues
    };
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log(`   Code: ${error.code || 'unknown'}`);
    
    if (error.code === 'auth/invalid-credential') {
      console.log('\n💡 This could be:');
      console.log('   1. Wrong password');
      console.log('   2. User does not exist');
      console.log('   3. Rate limiting (too many failed attempts)');
      console.log('\n   To check: Go to Firebase Console → Authentication → Users');
      console.log(`   Search for: ${email}`);
    }
    
    return {
      email,
      uid: null,
      authWorks: false,
      firestoreExists: false,
      roleCorrect: false,
      issues: [error.message]
    };
  }
}

async function main() {
  console.log('\n');
  console.log('🔍 DEMO USER VERIFICATION TOOL');
  console.log('================================\n');
  console.log('This will test all demo users for:');
  console.log('  1. Firebase Authentication (can they login?)');
  console.log('  2. Firestore Document (do they have a user profile?)');
  console.log('  3. Correct Role (client vs guard)');
  console.log('  4. Required Fields (email, role, createdAt)');
  console.log('\n');
  
  const results = [];
  
  for (const user of DEMO_USERS) {
    const result = await verifyUser(user.email, user.password, user.expectedRole);
    results.push(result);
  }
  
  // Final Report
  console.log('\n');
  console.log('='.repeat(60));
  console.log('FINAL REPORT');
  console.log('='.repeat(60));
  console.log('\n');
  
  results.forEach(result => {
    const status = result.authWorks && result.firestoreExists && result.roleCorrect && result.issues.length === 0 
      ? '✅ WORKING' 
      : '❌ BROKEN';
    
    console.log(`${status} - ${result.email}`);
    if (result.uid) {
      console.log(`         UID: ${result.uid}`);
    }
    if (result.issues.length > 0) {
      result.issues.forEach(issue => {
        console.log(`         ⚠️  ${issue}`);
      });
    }
    console.log('');
  });
  
  const workingCount = results.filter(r => r.authWorks && r.firestoreExists && r.roleCorrect && r.issues.length === 0).length;
  console.log(`\nTotal: ${workingCount}/${DEMO_USERS.length} users working correctly\n`);
  
  if (workingCount < DEMO_USERS.length) {
    console.log('⚠️  NEXT STEPS:');
    console.log('   1. Check Firebase Console → Authentication → Users');
    console.log('   2. Verify users exist and are enabled');
    console.log('   3. Check Firebase Console → Firestore → users collection');
    console.log('   4. For missing Firestore docs, run: node setup-demo-users-production.cjs');
    console.log('   5. For auth errors, may need to reset passwords or wait for rate limit\n');
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
