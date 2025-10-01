import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const demoUsers = [
  {
    email: 'client@demo.com',
    password: 'demo123',
    firstName: 'John',
    lastName: 'Client',
    phone: '+1234567890',
    role: 'client' as const,
  },
  {
    email: 'guard1@demo.com',
    password: 'demo123',
    firstName: 'Mike',
    lastName: 'Security',
    phone: '+1234567891',
    role: 'guard' as const,
  },
  {
    email: 'guard2@demo.com',
    password: 'demo123',
    firstName: 'Sarah',
    lastName: 'Protection',
    phone: '+1234567892',
    role: 'guard' as const,
  },
  {
    email: 'company@demo.com',
    password: 'demo123',
    firstName: 'Elite',
    lastName: 'Security',
    phone: '+1234567893',
    role: 'company' as const,
  },
  {
    email: 'admin@demo.com',
    password: 'demo123',
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

  try {
    for (const userData of demoUsers) {
      try {
        console.log(`Creating user: ${userData.email}`);
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.role,
          language: 'en',
          kycStatus: userData.role === 'guard' ? 'approved' : 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        console.log(`✅ Created user: ${userData.email}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠️  User already exists: ${userData.email}`);
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error);
        }
      }
    }

    for (const guard of demoGuards) {
      try {
        console.log(`Creating guard profile: ${guard.name}`);
        await addDoc(collection(db, 'guards'), {
          ...guard,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`✅ Created guard: ${guard.name}`);
      } catch (error) {
        console.error(`❌ Error creating guard ${guard.name}:`, error);
      }
    }

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
