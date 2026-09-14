require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

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

const PASSWORD = '<contrasena en tu .env local, no en el repositorio>';

const users = [
  { email: 'client@demo.com', role: 'client', name: 'Demo Client' },
  { email: 'guard1@demo.com', role: 'guard', name: 'Guard One' },
  { email: 'guard2@demo.com', role: 'guard', name: 'Guard Two' },
];

async function resetUser(email, role, name) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Resetting password for: ${email}`);
  console.log('='.repeat(60));
  
  try {
    // Try to create the user - if it exists, we'll get an error telling us so
    console.log('📧 Attempting to create user...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, PASSWORD);
    const user = userCredential.user;
    
    console.log('✅ User created successfully!');
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    
    // Create Firestore document
    console.log('\n📄 Creating Firestore document...');
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email: email,
      role: role,
      name: name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Firestore document created');
    
    // Sign out
    await signOut(auth);
    console.log('✅ Signed out');
    
    return { success: true, uid: user.uid, existed: false };
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  User already exists in Firebase Auth');
      console.log('\n⚠️  PROBLEM: Cannot reset password using client SDK!');
      console.log('   The user exists but we cannot change their password.');
      console.log('');
      console.log('   TO FIX:');
      console.log('   1. Go to Firebase Console: https://console.firebase.google.com/');
      console.log(`   2. Project: ${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}`);
      console.log('   3. Authentication → Users');
      console.log(`   4. Find: ${email}`);
      console.log('   5. Click "..." menu → "Reset password"');
      console.log('   6. Set password to: <contrasena en tu .env local, no en el repositorio>');
      console.log('');
      console.log('   OR DELETE AND RECREATE:');
      console.log(`   4. Find: ${email}`);
      console.log('   5. Click "..." menu → "Delete user"');
      console.log('   6. Run this script again');
      console.log('');
      
      return { success: false, existed: true, error: 'User exists, cannot reset password' };
    } else {
      console.log('❌ ERROR:', error.message);
      console.log(`   Code: ${error.code || 'unknown'}`);
      return { success: false, existed: false, error: error.message };
    }
  }
}

async function main() {
  console.log('\n');
  console.log('🔐 PASSWORD RESET TOOL');
  console.log('======================\n');
  console.log(`Target password: ${PASSWORD}`);
  console.log('\n');
  
  const results = [];
  
  for (const user of users) {
    const result = await resetUser(user.email, user.role, user.name);
    results.push({ email: user.email, ...result });
  }
  
  // Final Report
  console.log('\n');
  console.log('='.repeat(60));
  console.log('FINAL REPORT');
  console.log('='.repeat(60));
  console.log('\n');
  
  const created = results.filter(r => r.success && !r.existed);
  const existed = results.filter(r => r.existed);
  const failed = results.filter(r => !r.success && !r.existed);
  
  if (created.length > 0) {
    console.log('✅ NEWLY CREATED:');
    created.forEach(r => console.log(`   - ${r.email} (UID: ${r.uid})`));
    console.log('');
  }
  
  if (existed.length > 0) {
    console.log('⚠️  ALREADY EXIST (need manual password reset):');
    existed.forEach(r => console.log(`   - ${r.email}`));
    console.log('');
    console.log('   Next steps:');
    console.log('   1. Go to Firebase Console: https://console.firebase.google.com/');
    console.log(`   2. Project: ${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}`);
    console.log('   3. Authentication → Users');
    console.log('   4. For each user above:');
    console.log('      a. Click "..." menu');
    console.log('      b. Select "Delete user"');
    console.log('   5. Run this script again to recreate with known password');
    console.log('');
  }
  
  if (failed.length > 0) {
    console.log('❌ FAILED:');
    failed.forEach(r => console.log(`   - ${r.email}: ${r.error}`));
    console.log('');
  }
  
  console.log('\nPassword for all accounts: <contrasena en tu .env local, no en el repositorio>\n');
  
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
