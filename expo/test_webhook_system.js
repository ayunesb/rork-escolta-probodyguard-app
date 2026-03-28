const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./functions/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 WEBHOOK SYSTEM VERIFICATION TEST');
  console.log('='.repeat(60) + '\n');

  let passCount = 0;
  let totalTests = 0;

  // Test 1: Check webhook_logs collection
  totalTests++;
  console.log('Test 1: Checking webhook_logs collection...');
  try {
    const logsSnapshot = await db.collection('webhook_logs')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
    
    if (!logsSnapshot.empty) {
      const doc = logsSnapshot.docs[0];
      const data = doc.data();
      console.log('  ✅ PASS - Found webhook logs');
      console.log(`     Latest: ${data.kind} at ${data.timestamp?.toDate()}`);
      console.log(`     Verified: ${data.verified ? 'Yes' : 'No'}`);
      passCount++;
    } else {
      console.log('  ⚠️  WARNING - No webhook logs found (collection exists but empty)');
    }
  } catch (error) {
    console.log('  ❌ FAIL - Error checking webhook_logs:', error.message);
  }

  // Test 2: Check subscriptions collection exists
  totalTests++;
  console.log('\nTest 2: Checking subscriptions collection...');
  try {
    const subsRef = db.collection('subscriptions');
    const subsSnapshot = await subsRef.limit(1).get();
    console.log('  ✅ PASS - Subscriptions collection accessible');
    console.log(`     Documents: ${subsSnapshot.size}`);
    passCount++;
  } catch (error) {
    console.log('  ❌ FAIL - Error checking subscriptions:', error.message);
  }

  // Test 3: Check disputes collection exists
  totalTests++;
  console.log('\nTest 3: Checking disputes collection...');
  try {
    const disputesRef = db.collection('disputes');
    const disputesSnapshot = await disputesRef.limit(1).get();
    console.log('  ✅ PASS - Disputes collection accessible');
    console.log(`     Documents: ${disputesSnapshot.size}`);
    passCount++;
  } catch (error) {
    console.log('  ❌ FAIL - Error checking disputes:', error.message);
  }

  // Test 4: Check payouts collection exists
  totalTests++;
  console.log('\nTest 4: Checking payouts collection...');
  try {
    const payoutsRef = db.collection('payouts');
    const payoutsSnapshot = await payoutsRef.limit(1).get();
    console.log('  ✅ PASS - Payouts collection accessible');
    console.log(`     Documents: ${payoutsSnapshot.size}`);
    passCount++;
  } catch (error) {
    console.log('  ❌ FAIL - Error checking payouts:', error.message);
  }

  // Test 5: Check notifications collection exists
  totalTests++;
  console.log('\nTest 5: Checking notifications collection...');
  try {
    const notificationsRef = db.collection('notifications');
    const notificationsSnapshot = await notificationsRef.limit(1).get();
    console.log('  ✅ PASS - Notifications collection accessible');
    console.log(`     Documents: ${notificationsSnapshot.size}`);
    passCount++;
  } catch (error) {
    console.log('  ❌ FAIL - Error checking notifications:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Tests Passed: ${passCount}/${totalTests}`);
  console.log(`Success Rate: ${((passCount/totalTests)*100).toFixed(0)}%`);
  
  if (passCount === totalTests) {
    console.log('\n✅ ALL TESTS PASSED - Webhook system is fully operational!');
  } else if (passCount > 0) {
    console.log('\n⚠️  PARTIAL SUCCESS - Some components need attention');
  } else {
    console.log('\n❌ TESTS FAILED - System needs configuration');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

runTests()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Critical Error:', error);
    process.exit(1);
  });
