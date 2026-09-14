// Las contrasenas salen de DEMO_PASS_SEED en el entorno. Sin DEMO_PASS_SEED
// este sembrador no crea nada, a proposito: este repositorio es publico.
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAjjsRChFfCQi3piUdtiUCqyysFrh2Cdes',
  authDomain: 'escolta-pro-fe90e.firebaseapp.com',
  projectId: 'escolta-pro-fe90e',
  storageBucket: 'escolta-pro-fe90e.firebasestorage.app',
  messagingSenderId: '919834684647',
  appId: '1:919834684647:web:60dad6457ad0f92b068642',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const demoUsers = [
  {
    email: 'client@demo.com',
    password: process.env.DEMO_PASS_SEED ?? '',
    firstName: 'John',
    lastName: 'Client',
    phone: '+1234567890',
    role: 'client' as const,
  },
  {
    email: 'guard1@demo.com',
    password: process.env.DEMO_PASS_SEED ?? '',
    firstName: 'Mike',
    lastName: 'Security',
    phone: '+1234567891',
    role: 'guard' as const,
  },
  {
    email: 'guard2@demo.com',
    password: process.env.DEMO_PASS_SEED ?? '',
    firstName: 'Sarah',
    lastName: 'Protection',
    phone: '+1234567892',
    role: 'guard' as const,
  },
  {
    email: 'company@demo.com',
    password: process.env.DEMO_PASS_SEED ?? '',
    firstName: 'Elite',
    lastName: 'Security',
    phone: '+1234567893',
    role: 'company' as const,
  },
  {
    email: 'admin@demo.com',
    password: process.env.DEMO_PASS_SEED ?? '',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+1234567894',
    role: 'admin' as const,
  },
];

const demoGuards = [
  {
    name: 'Mike Security',
    rating: 4.8,
    reviews: 127,
    hourlyRate: 45,
    experience: 8,
    specialties: ['Armed Security', 'Event Security', 'VIP Protection'],
    languages: ['English', 'Spanish'],
    certifications: ['CPR', 'First Aid', 'Armed Guard License'],
    availability: 'Available Now',
    location: { latitude: 40.7128, longitude: -74.006 },
    verified: true,
    responseTime: '< 5 min',
  },
  {
    name: 'Sarah Protection',
    rating: 4.9,
    reviews: 203,
    hourlyRate: 55,
    experience: 12,
    specialties: ['Executive Protection', 'Close Protection', 'Risk Assessment'],
    languages: ['English', 'French', 'Arabic'],
    certifications: ['CPR', 'First Aid', 'Executive Protection', 'Tactical Training'],
    availability: 'Available Now',
    location: { latitude: 40.7589, longitude: -73.9851 },
    verified: true,
    responseTime: '< 3 min',
  },
  {
    name: 'Carlos Rodriguez',
    rating: 4.7,
    reviews: 89,
    hourlyRate: 40,
    experience: 6,
    specialties: ['Residential Security', 'Patrol Services', 'Access Control'],
    languages: ['English', 'Spanish'],
    certifications: ['CPR', 'First Aid', 'Security Guard License'],
    availability: 'Available Today',
    location: { latitude: 40.7489, longitude: -73.9680 },
    verified: true,
    responseTime: '< 10 min',
  },
];

async function seedFirebase() {
  console.log('🌱 Starting Firebase seeding...');
  console.log('📍 Project ID:', firebaseConfig.projectId);
  console.log('📍 Auth Domain:', firebaseConfig.authDomain);

  try {
    console.log('\n👥 Creating users...');
    
    for (const userData of demoUsers) {
      try {
        console.log(`\n📝 Creating user: ${userData.email}`);
        let userCredential;
        let isNewUser = false;
        
        try {
          userCredential = await createUserWithEmailAndPassword(
            auth,
            userData.email,
            userData.password
          );
          isNewUser = true;
          console.log(`  UID: ${userCredential.user.uid}`);
        } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') {
            console.log(`  ⚠️  User already exists: ${userData.email}`);
            userCredential = await signInWithEmailAndPassword(
              auth,
              userData.email,
              userData.password
            );
            console.log(`  UID: ${userCredential.user.uid}`);
          } else {
            throw error;
          }
        }

        const kycStatus = userData.role === 'guard' ? 'approved' : 'pending';
        const userDoc = {
          id: userCredential.user.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.role,
          language: 'en',
          kycStatus,
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);
        console.log(`✅ ${isNewUser ? 'Created' : 'Updated'} user: ${userData.email}`);
        
        await signOut(auth);
      } catch (error: any) {
        console.error(`❌ Error creating user ${userData.email}:`);
        console.error(`   Code: ${error.code}`);
        console.error(`   Message: ${error.message}`);
        try {
          await signOut(auth);
        } catch {}
      }
    }

    console.log('\n🛡️  Creating guard profiles...');
    console.log('  Signing in as admin to create guard profiles...');
    
    await signInWithEmailAndPassword(auth, 'admin@demo.com', process.env.DEMO_PASS_SEED ?? '');
    console.log('  ✅ Signed in as admin');
    
    for (const guard of demoGuards) {
      try {
        console.log(`\n📝 Creating guard profile: ${guard.name}`);
        const docRef = await addDoc(collection(db, 'guards'), {
          ...guard,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`  ID: ${docRef.id}`);
        console.log(`✅ Created guard: ${guard.name}`);
      } catch (error: any) {
        console.error(`❌ Error creating guard ${guard.name}:`);
        console.error(`   Message: ${error.message}`);
      }
    }
    
    await signOut(auth);
    console.log('\n  ✅ Signed out')

    console.log('✅ Firebase seeding completed!');
    console.log('\n📋 Demo Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    demoUsers.forEach((user) => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seedFirebase()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
