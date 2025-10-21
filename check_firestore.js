const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkWebhookLogs() {
  console.log('\n🔍 Checking webhook_logs collection...\n');
  
  const logsSnapshot = await db.collection('webhook_logs')
    .orderBy('timestamp', 'desc')
    .limit(5)
    .get();
  
  if (logsSnapshot.empty) {
    console.log('❌ No webhook logs found');
  } else {
    console.log(`✅ Found ${logsSnapshot.size} recent webhook logs:\n`);
    logsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.kind || 'unknown'} - ${data.timestamp?.toDate() || 'no timestamp'}`);
      console.log(`   Verified: ${data.verified ? '✅' : '❌'}`);
      console.log(`   Doc ID: ${doc.id}\n`);
    });
  }
}

checkWebhookLogs()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
