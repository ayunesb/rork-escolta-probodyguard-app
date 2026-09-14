#!/usr/bin/env node

/**
 * Direct Password Reset Tool
 * 
 * Uses Firebase Admin SDK to directly set passwords
 * without requiring email verification.
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Admin SDK
// Check if already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const USERS_TO_FIX = [
  { email: 'guard1@demo.com', newPassword: '<contrasena en tu .env local, no en el repositorio>' },
  { email: 'guard2@demo.com', newPassword: '<contrasena en tu .env local, no en el repositorio>' },
];

async function resetPassword(email, newPassword) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Resetting password for: ${email}`);
  console.log('='.repeat(60));
  
  try {
    // Get user by email
    console.log('📧 Step 1: Finding user in Firebase Auth...');
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ User found!`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   Email verified: ${userRecord.emailVerified}`);
    
    // Update password
    console.log('\n🔐 Step 2: Setting new password...');
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
      emailVerified: true // Also verify the email
    });
    
    console.log('✅ Password updated successfully!');
    console.log(`   New password: ${newPassword}`);
    console.log('   Email marked as verified');
    
    return { success: true, email, uid: userRecord.uid };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 User does not exist in Firebase Auth');
      console.log('   This means the account was never created.');
      console.log('   Would you like to create it? (Y/n)');
    }
    
    return { success: false, email, error: error.message };
  }
}

async function main() {
  console.log('\n🔐 DIRECT PASSWORD RESET TOOL');
  console.log('================================\n');
  console.log('This will directly set passwords using Firebase Admin SDK');
  console.log('No email verification required!\n');
  
  // Check if Admin SDK is properly initialized
  try {
    console.log('🔍 Checking Firebase Admin SDK...');
    const app = admin.app();
    console.log('✅ Admin SDK initialized');
    console.log(`   Project ID: ${app.options.projectId}\n`);
  } catch (error) {
    console.error('❌ Admin SDK not initialized properly');
    console.error('   Error:', error.message);
    console.error('\n💡 You need to authenticate Firebase Admin SDK:');
    console.error('   Option 1: Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
    console.error('   Option 2: Run: firebase login --reauth');
    console.error('   Option 3: Run: gcloud auth application-default login\n');
    process.exit(1);
  }
  
  const results = [];
  
  for (const user of USERS_TO_FIX) {
    const result = await resetPassword(user.email, user.newPassword);
    results.push(result);
    
    // Pause between users
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const successCount = results.filter(r => r.success).length;
  
  results.forEach(r => {
    if (r.success) {
      console.log(`✅ SUCCESS - ${r.email}`);
      console.log(`   UID: ${r.uid}`);
      console.log(`   Password: <contrasena en tu .env local, no en el repositorio>`);
      console.log('');
    } else {
      console.log(`❌ FAILED - ${r.email}`);
      console.log(`   Error: ${r.error}`);
      console.log('');
    }
  });
  
  console.log(`Result: ${successCount}/${results.length} passwords reset\n`);
  
  if (successCount === results.length) {
    console.log('🎉 ALL PASSWORDS RESET SUCCESSFULLY!');
    console.log('\nYou can now login with:');
    console.log('   • guard1@demo.com / <contrasena en tu .env local, no en el repositorio>');
    console.log('   • guard2@demo.com / <contrasena en tu .env local, no en el repositorio>');
    console.log('\nNext: Run verification to confirm:');
    console.log('   node verify-complete-setup.cjs\n');
  } else {
    console.log('⚠️  Some passwords could not be reset.');
    console.log('\nIf Admin SDK authentication failed:');
    console.log('   1. Run: firebase login --reauth');
    console.log('   2. Or run: gcloud auth application-default login');
    console.log('   3. Then try this script again\n');
  }
}

main()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
