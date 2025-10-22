/**
 * Quick script to create demo guard users
 * Run with: node setup-guards-simple.cjs
 */

// Load environment variables
require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Initialize Firebase (using your app's config)
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

async function createGuardUser(email, firstName, lastName, rating, totalBookings) {
  try {
    console.log(`\n📝 Creating ${email}...`);
    
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, 'demo123');
    const userId = userCredential.user.uid;
    
    console.log(`✅ Auth user created: ${userId}`);
    
    // Create Firestore document
    await setDoc(doc(db, 'users', userId), {
      email,
      role: 'guard',
      firstName,
      lastName,
      phone: `+52${Math.floor(Math.random() * 1000000000)}`,
      language: 'en',
      kycStatus: 'approved',
      isActive: true,
      emailVerified: true,
      verified: true,
      rating,
      totalBookings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    console.log(`✅ Firestore document created for ${email}`);
    
    // Sign out after creating
    await auth.signOut();
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`⚠️  ${email} already exists, skipping...`);
    } else {
      console.error(`❌ Error creating ${email}:`, error.message);
    }
  }
}

async function main() {
  console.log('🔥 Creating demo guard users...');
  
  await createGuardUser('guard1@demo.com', 'Chris', 'M.', 4.8, 127);
  await createGuardUser('guard2@demo.com', 'Alex', 'R.', 4.9, 95);
  
  console.log('\n🎉 Setup complete!');
  console.log('\n📝 You can now login with:');
  console.log('   - guard1@demo.com / demo123');
  console.log('   - guard2@demo.com / demo123\n');
  
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
