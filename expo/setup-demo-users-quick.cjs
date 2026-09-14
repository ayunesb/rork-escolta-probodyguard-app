const admin = require('firebase-admin');

// Initialize Firebase Admin with emulator settings
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

admin.initializeApp({
  projectId: 'escolta-pro-fe90e',
});

const auth = admin.auth();
const firestore = admin.firestore();

async function createDemoUsers() {
  console.log('🔥 Creating demo users in Firebase emulators...\n');

  try {
    // Create client user
    const clientUser = await auth.createUser({
      uid: 'jTcSgWOn7HYYA4uLvX2ocjmVGfLG',
      email: 'client@demo.com',
      password: '<contrasena en tu .env local, no en el repositorio>',
      displayName: 'Demo Client',
      emailVerified: true,
    });
    console.log('✅ Created client user:', clientUser.uid);

    // Create client Firestore document
    await firestore.collection('users').doc(clientUser.uid).set({
      email: 'client@demo.com',
      role: 'client',
      displayName: 'Demo Client',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: true,
    });
    console.log('✅ Created client Firestore document\n');

    // Create guard user
    const guardUser = await auth.createUser({
      uid: '3dbaQP01KvZ9U8qa0CRpSn73U20J',
      email: 'guard1@demo.com',
      password: '<contrasena en tu .env local, no en el repositorio>',
      displayName: 'Demo Guard',
      emailVerified: true,
    });
    console.log('✅ Created guard user:', guardUser.uid);

    // Create guard Firestore document
    await firestore.collection('users').doc(guardUser.uid).set({
      email: 'guard1@demo.com',
      role: 'guard',
      displayName: 'Demo Guard',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: true,
      available: true,
    });
    console.log('✅ Created guard Firestore document\n');

    console.log('🎉 Demo users created successfully!\n');
    console.log('📋 Login credentials:');
    console.log('   Client: client@demo.com / <contrasena en tu .env local, no en el repositorio>');
    console.log('   Guard: guard1@demo.com / <contrasena en tu .env local, no en el repositorio>\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
    process.exit(1);
  }
}

createDemoUsers();
