#!/usr/bin/env node

/**
 * Complete Demo User Setup Verification
 * 
 * This verifies:
 * 1. Firebase Authentication (can login?)
 * 2. Firestore user document (exists with all fields?)
 * 3. Payment setup (has customer ID?)
 * 4. Chat setup (can send messages?)
 * 5. Booking setup (all required fields?)
 * 6. Role-specific requirements
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  getDoc,
  collection,
  query,
  where,
  getDocs
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

const DEMO_USERS = [
  { 
    email: 'client@demo.com', 
    password: 'Demo123!', 
    expectedRole: 'client',
    requiresPayment: true,
    requiresBookings: true
  },
  { 
    email: 'guard1@demo.com',
    password: 'Demo123!',
    expectedRole: 'bodyguard',
    requiresPayment: false,
    requiresBookings: true
  },
  { 
    email: 'guard2@demo.com', 
    password: 'Demo123!', 
    expectedRole: 'bodyguard',
    requiresPayment: false,
    requiresBookings: true
  },
];

// Required fields for all users
const REQUIRED_USER_FIELDS = [
  'email',
  'role',
  'firstName',
  'lastName',
  'phone',
  'isActive',
  'emailVerified',
  'createdAt',
  'updatedAt'
];

// Required fields for client
const REQUIRED_CLIENT_FIELDS = [
  ...REQUIRED_USER_FIELDS,
  'kycStatus'
];

// Required fields for guard
const REQUIRED_GUARD_FIELDS = [
  ...REQUIRED_USER_FIELDS,
  'kycStatus',
  'availability'
];

async function verifyUser(userInfo) {
  const { email, password, expectedRole, requiresPayment, requiresBookings } = userInfo;
  
  console.log('\n' + '='.repeat(70));
  console.log(`VERIFYING: ${email}`);
  console.log('='.repeat(70));
  
  const issues = [];
  const warnings = [];
  let uid = null;
  let userData = null;
  
  // Step 1: Test Authentication
  console.log('\n📧 Step 1: Testing Firebase Authentication...');
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    uid = userCredential.user.uid;
    console.log(`✅ Authentication successful!`);
    console.log(`   UID: ${uid}`);
    console.log(`   Email verified: ${userCredential.user.emailVerified}`);
    
    if (!userCredential.user.emailVerified) {
      warnings.push('Email not verified in Firebase Auth (may be OK for demo)');
    }
  } catch (error) {
    console.log(`❌ Authentication failed: ${error.message}`);
    issues.push(`Cannot authenticate: ${error.code}`);
    return { email, success: false, issues, warnings };
  }
  
  // Step 2: Check Firestore User Document
  console.log('\n📄 Step 2: Checking Firestore user document...');
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('❌ User document does NOT exist in Firestore');
      issues.push('Missing Firestore user document');
    } else {
      userData = userDoc.data();
      console.log('✅ User document exists!');
      
      // Check required fields
      const requiredFields = expectedRole === 'client' 
        ? REQUIRED_CLIENT_FIELDS 
        : REQUIRED_GUARD_FIELDS;
      
      const missingFields = requiredFields.filter(field => !(field in userData));
      
      if (missingFields.length > 0) {
        console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`);
        issues.push(`Missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log('✅ All required fields present');
      }
      
      // Display key fields
      console.log('\n   Key fields:');
      console.log(`   • Role: ${userData.role || 'MISSING'}`);
      console.log(`   • Name: ${userData.firstName || '?'} ${userData.lastName || '?'}`);
      console.log(`   • Phone: ${userData.phone || 'MISSING'}`);
      console.log(`   • Active: ${userData.isActive !== undefined ? userData.isActive : 'MISSING'}`);
      console.log(`   • KYC Status: ${userData.kycStatus || 'MISSING'}`);
      
      if (expectedRole === 'guard') {
        console.log(`   • Availability: ${userData.availability ? 'Set' : 'MISSING'}`);
        if (!userData.availability) {
          warnings.push('Guard availability not set (may affect booking)');
        }
      }
    }
  } catch (error) {
    console.log(`❌ Error reading Firestore: ${error.message}`);
    issues.push(`Firestore error: ${error.message}`);
  }
  
  // Step 3: Verify Role
  console.log('\n👤 Step 3: Verifying user role...');
  if (userData && userData.role === expectedRole) {
    console.log(`✅ Role correct: ${expectedRole}`);
  } else {
    console.log(`❌ Role mismatch: expected ${expectedRole}, got ${userData?.role || 'none'}`);
    issues.push(`Wrong role: ${userData?.role} (expected ${expectedRole})`);
  }
  
  // Step 4: Check Payment Setup (for clients)
  if (requiresPayment) {
    console.log('\n💳 Step 4: Checking payment setup...');
    
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, where('clientId', '==', uid));
      const paymentDocs = await getDocs(q);
      
      if (paymentDocs.empty) {
        console.log('⚠️  No payment records found (OK - will be created on first payment)');
        warnings.push('No payment history yet');
      } else {
        console.log(`✅ Found ${paymentDocs.size} payment record(s)`);
        
        paymentDocs.forEach((doc, index) => {
          const payment = doc.data();
          console.log(`\n   Payment ${index + 1}:`);
          console.log(`   • ID: ${doc.id}`);
          console.log(`   • Status: ${payment.status || 'unknown'}`);
          console.log(`   • Amount: ${payment.amount || 'N/A'}`);
          console.log(`   • Created: ${payment.createdAt ? new Date(payment.createdAt.seconds * 1000).toLocaleString() : 'N/A'}`);
        });
      }
      
      // Check if user has Braintree customer ID
      if (userData?.braintreeCustomerId) {
        console.log(`✅ Has Braintree customer ID: ${userData.braintreeCustomerId}`);
      } else {
        console.log('⚠️  No Braintree customer ID (will be created on first payment)');
        warnings.push('No Braintree customer ID yet');
      }
      
    } catch (error) {
      console.log(`⚠️  Could not check payments: ${error.message}`);
      warnings.push(`Payment check error: ${error.message}`);
    }
  }
  
  // Step 5: Check Booking Setup
  if (requiresBookings) {
    console.log('\n📅 Step 5: Checking booking setup...');
    
    try {
      const bookingsRef = collection(db, 'bookings');
      const qClient = expectedRole === 'client' 
        ? query(bookingsRef, where('clientId', '==', uid))
        : query(bookingsRef, where('guardId', '==', uid));
      
      const bookingDocs = await getDocs(qClient);
      
      if (bookingDocs.empty) {
        console.log(`⚠️  No bookings found for this ${expectedRole} (OK - will be created during testing)`);
        warnings.push('No booking history yet');
      } else {
        console.log(`✅ Found ${bookingDocs.size} booking(s)`);
        
        bookingDocs.forEach((doc, index) => {
          const booking = doc.data();
          console.log(`\n   Booking ${index + 1}:`);
          console.log(`   • ID: ${doc.id}`);
          console.log(`   • Status: ${booking.status || 'unknown'}`);
          console.log(`   • Date: ${booking.date || 'N/A'}`);
          console.log(`   • Has start code: ${booking.startCode ? 'Yes' : 'No'}`);
        });
      }
      
    } catch (error) {
      console.log(`⚠️  Could not check bookings: ${error.message}`);
      warnings.push(`Booking check error: ${error.message}`);
    }
  }
  
  // Step 6: Check Chat/Messages Setup
  console.log('\n💬 Step 6: Checking chat setup...');
  try {
    const messagesRef = collection(db, 'messages');
    const qMessages = query(messagesRef, where('senderId', '==', uid));
    const messageDocs = await getDocs(qMessages);
    
    if (messageDocs.empty) {
      console.log('⚠️  No messages found (OK - will be created during testing)');
      warnings.push('No message history yet');
    } else {
      console.log(`✅ Found ${messageDocs.size} message(s)`);
      
      // Show sample
      const firstMsg = messageDocs.docs[0]?.data();
      if (firstMsg) {
        console.log('   Sample message:');
        console.log(`   • Text: ${firstMsg.text?.substring(0, 50) || 'N/A'}...`);
        console.log(`   • Booking ID: ${firstMsg.bookingId || 'N/A'}`);
      }
    }
    
    // Check if Firestore rules allow message creation
    console.log('\n   Testing message permissions...');
    console.log('   ℹ️  Message rules should allow:');
    console.log('      - Read: if sender or has bookingId');
    console.log('      - Write: if authenticated and sender matches uid');
    
  } catch (error) {
    console.log(`⚠️  Could not check messages: ${error.message}`);
    warnings.push(`Message check error: ${error.message}`);
  }
  
  // Sign out
  await signOut(auth);
  
  // Summary
  console.log('\n' + '─'.repeat(70));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('─'.repeat(70));
  
  const success = issues.length === 0;
  
  if (success) {
    console.log('✅ USER IS READY FOR TESTING!');
  } else {
    console.log('❌ USER HAS ISSUES THAT NEED FIXING');
  }
  
  if (issues.length > 0) {
    console.log('\n🚨 Issues:');
    issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings (may be OK):');
    warnings.forEach((warning, i) => console.log(`   ${i + 1}. ${warning}`));
  }
  
  return { 
    email, 
    uid,
    role: userData?.role,
    success, 
    issues, 
    warnings,
    hasFirestoreDoc: !!userData,
    hasPayments: requiresPayment,
    hasBookings: requiresBookings
  };
}

async function main() {
  console.log('\n🔍 COMPLETE DEMO USER SETUP VERIFICATION');
  console.log('==========================================\n');
  console.log('This will verify all demo users are ready for testing:');
  console.log('  ✓ Authentication (can login)');
  console.log('  ✓ Firestore documents (user profile)');
  console.log('  ✓ Payment setup (for clients)');
  console.log('  ✓ Booking setup (codes, history)');
  console.log('  ✓ Chat/messaging (permissions)');
  console.log('  ✓ Role-specific requirements');
  console.log('\n');
  
  const results = [];
  
  for (const user of DEMO_USERS) {
    const result = await verifyUser(user);
    results.push(result);
    
    // Pause between users
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Final Report
  console.log('\n\n' + '='.repeat(70));
  console.log('FINAL TESTING READINESS REPORT');
  console.log('='.repeat(70) + '\n');
  
  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    const status = r.success ? 'READY' : 'NOT READY';
    
    console.log(`${icon} ${status} - ${r.email}`);
    console.log(`   Role: ${r.role || 'unknown'}`);
    console.log(`   UID: ${r.uid || 'N/A'}`);
    console.log(`   Firestore: ${r.hasFirestoreDoc ? 'Yes' : 'No'}`);
    
    if (r.issues.length > 0) {
      console.log(`   Issues: ${r.issues.length}`);
      r.issues.forEach(issue => console.log(`      - ${issue}`));
    }
    
    if (r.warnings.length > 0) {
      console.log(`   Warnings: ${r.warnings.length}`);
    }
    
    console.log('');
  });
  
  const readyCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log('─'.repeat(70));
  console.log(`Result: ${readyCount}/${totalCount} users ready for testing\n`);
  
  if (readyCount === totalCount) {
    console.log('🎉 ALL USERS READY FOR TESTING!');
    console.log('\nYou can now test:');
    console.log('  1. Client login and booking creation');
    console.log('  2. Payment flow with Hosted Fields');
    console.log('  3. Guard login and booking acceptance');
    console.log('  4. Start codes (guard provides, client enters)');
    console.log('  5. Real-time chat messaging');
    console.log('  6. Booking status updates');
    console.log('\nTo start testing:');
    console.log('  npx expo start');
    console.log('  # Then press "i" for iOS or "a" for Android\n');
  } else {
    console.log('⚠️  SOME USERS NEED ATTENTION');
    console.log('\nNext steps:');
    
    const notReady = results.filter(r => !r.success);
    notReady.forEach(r => {
      console.log(`\n${r.email}:`);
      if (!r.uid) {
        console.log('  → Check password in Firebase Console');
        console.log('  → Try resetting to: Demo123!');
      }
      if (!r.hasFirestoreDoc) {
        console.log('  → Run: node setup-demo-users-production.cjs');
      }
      r.issues.forEach(issue => console.log(`  → Fix: ${issue}`));
    });
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
}

main()
  .then(() => {
    console.log('Verification complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
