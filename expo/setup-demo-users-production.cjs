const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin for PRODUCTION
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'escolta-pro-fe90e',
});

const auth = admin.auth();
const firestore = admin.firestore();

async function createDemoUsers() {
  console.log('🔥 Creating demo users in Firebase PRODUCTION...\n');

  try {
    // Create guard1 user
    try {
      const guard1User = await auth.createUser({
        email: 'guard1@demo.com',
        password: '<contrasena en tu .env local, no en el repositorio>',
        displayName: 'Chris M.',
        emailVerified: true,
      });
      console.log('✅ Created guard1 user:', guard1User.uid);

      // Create guard1 Firestore document
      await firestore.collection('users').doc(guard1User.uid).set({
        email: 'guard1@demo.com',
        role: 'guard',
        firstName: 'Chris',
        lastName: 'M.',
        phone: '+1234567890',
        language: 'en',
        kycStatus: 'approved',
        isActive: true,
        emailVerified: true,
        verified: true,
        rating: 4.8,
        totalBookings: 127,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ Created guard1 Firestore document\n');
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  guard1@demo.com already exists, skipping...\n');
      } else {
        throw error;
      }
    }

    // Create guard2 user
    try {
      const guard2User = await auth.createUser({
        email: 'guard2@demo.com',
        password: '<contrasena en tu .env local, no en el repositorio>',
        displayName: 'Alex R.',
        emailVerified: true,
      });
      console.log('✅ Created guard2 user:', guard2User.uid);

      // Create guard2 Firestore document
      await firestore.collection('users').doc(guard2User.uid).set({
        email: 'guard2@demo.com',
        role: 'guard',
        firstName: 'Alex',
        lastName: 'R.',
        phone: '+1234567891',
        language: 'en',
        kycStatus: 'approved',
        isActive: true,
        emailVerified: true,
        verified: true,
        rating: 4.9,
        totalBookings: 95,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ Created guard2 Firestore document\n');
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  guard2@demo.com already exists, skipping...\n');
      } else {
        throw error;
      }
    }

    // Create company user
    try {
      const companyUser = await auth.createUser({
        email: 'company@demo.com',
        password: '<contrasena en tu .env local, no en el repositorio>',
        displayName: 'Demo Security Company',
        emailVerified: true,
      });
      console.log('✅ Created company user:', companyUser.uid);

      // Create company Firestore document
      await firestore.collection('users').doc(companyUser.uid).set({
        email: 'company@demo.com',
        role: 'company',
        firstName: 'Demo',
        lastName: 'Security',
        companyName: 'Demo Security Company',
        phone: '+1234567892',
        language: 'en',
        kycStatus: 'approved',
        isActive: true,
        emailVerified: true,
        verified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ Created company Firestore document\n');
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  company@demo.com already exists, skipping...\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 Demo users setup complete!\n');
    console.log('📝 You can now login with:');
    console.log('   - guard1@demo.com / <contrasena en tu .env local, no en el repositorio>');
    console.log('   - guard2@demo.com / <contrasena en tu .env local, no en el repositorio>');
    console.log('   - company@demo.com / <contrasena en tu .env local, no en el repositorio>');
    
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createDemoUsers();
