const admin = require('firebase-admin');

// For emulator, we can initialize without credentials
admin.initializeApp({
  projectId: 'escolta-pro-fe90e'
});

// Use emulator
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

async function createDemoUsers() {
  console.log('🔥 Creating demo users for Firebase Auth emulator...');
  
  const users = [
    {
      email: 'client@demo.com',
      password: 'demo123',
      displayName: 'Demo Client',
      role: 'client',
      firstName: 'Demo',
      lastName: 'Client',
      phone: '+1234567890'
    },
    {
      email: 'guard1@demo.com',
      password: 'demo123',
      displayName: 'Demo Guard',
      role: 'guard',
      firstName: 'Demo',
      lastName: 'Guard',
      phone: '+1234567891'
    }
  ];

  for (const userData of users) {
    try {
      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        emailVerified: true
      });
      
      console.log(`✅ Created Auth user: ${userData.email} (UID: ${userRecord.uid})`);
      
      // Create user document in Firestore
      const userDoc = {
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        language: 'en',
        kycStatus: 'approved',
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      await admin.firestore().collection('users').doc(userRecord.uid).set(userDoc);
      console.log(`✅ Created Firestore document for: ${userData.email}`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
      } else {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }
  }
  
  console.log('🎉 Demo users setup complete!');
  console.log('');
  console.log('📋 Available demo accounts:');
  console.log('   Email: client@demo.com');
  console.log('   Password: demo123');
  console.log('   Role: client');
  console.log('');
  console.log('   Email: guard1@demo.com'); 
  console.log('   Password: demo123');
  console.log('   Role: guard');
  console.log('');
  console.log('🚀 You can now sign in to your app with these credentials!');
  
  process.exit(0);
}

createDemoUsers().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});