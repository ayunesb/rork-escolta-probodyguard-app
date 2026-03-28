import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from 'firebase/app';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

async function createDemoUsers() {
  console.log('🚀 Creating demo users...\n');
  
  try {
    const createUsers = httpsCallable(functions, 'createDemoUsers');
    const result = await createUsers();
    const data: any = result.data;
    
    console.log(`✅ Success! Created ${data.created}/${data.total} users\n`);
    console.log('Results:');
    data.results.forEach((user: any) => {
      const icon = user.status === 'success' ? '✅' : '❌';
      console.log(`${icon} ${user.email} (${user.role || 'unknown'}) - ${user.status}`);
      if (user.message) {
        console.log(`   └─ ${user.message}`);
      }
    });
    
    console.log('\n✨ Demo users are ready! Try logging in at http://localhost:8081');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure Firebase Functions are deployed: firebase deploy --only functions');
    console.error('2. Check that you have the createDemoUsers function in functions/src/index.ts');
    console.error('3. Verify your Firebase project is set correctly: firebase use');
  }
}

createDemoUsers();
