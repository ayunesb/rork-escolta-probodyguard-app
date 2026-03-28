#!/usr/bin/env node

/**
 * Create Demo Users Script
 * 
 * This script calls the Firebase Cloud Function to create all 6 demo user documents.
 * Run with: node scripts/call-create-demo-users.js
 */

const https = require('https');

const FIREBASE_PROJECT = 'escolta-pro-fe90e';
const FUNCTION_URL = `https://createdemoUsers-jvzs7iqxgq-uc.a.run.app`;

console.log('🚀 Creating demo users in Firestore...\n');

const data = JSON.stringify({});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

const req = https.request(FUNCTION_URL, options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(responseData);
      
      if (result.result) {
        const data = result.result;
        console.log(`✅ Success! Created ${data.created}/${data.total} users\n`);
        console.log('Results:');
        data.results.forEach((user) => {
          const icon = user.status === 'success' ? '✅' : '❌';
          console.log(`${icon} ${user.email} (${user.role || 'unknown'}) - ${user.status}`);
          if (user.message) {
            console.log(`   └─ ${user.message}`);
          }
        });
        console.log('\n✨ Demo users are ready! Try logging in at http://localhost:8081');
      } else if (result.error) {
        console.error('❌ Error:', result.error.message);
      } else {
        console.log('Response:', responseData);
      }
    } catch (error) {
      console.error('Failed to parse response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(data);
req.end();
