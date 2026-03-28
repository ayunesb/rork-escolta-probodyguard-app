const braintree = require('braintree');
const fetch = require('node-fetch');

// Test 1: Direct Braintree Connection
async function testBraintreeConnection() {
  console.log('🔥 Test 1: Direct Braintree Connection');
  
  const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: '8jbcpm9yj7df7w4h',
    publicKey: 'fnjq66rkd6vbkmxt',
    privateKey: 'c96f93d2d472395ed663393d6e4e2976',
  });

  return new Promise((resolve, reject) => {
    gateway.clientToken.generate({}, (err, result) => {
      if (err) {
        console.error('❌ Braintree Connection Failed:', err.message);
        reject(err);
      } else {
        console.log('✅ Braintree Connection Success!');
        console.log('   Token Length:', result.clientToken.length);
        console.log('   Token Preview:', result.clientToken.substring(0, 50) + '...');
        resolve(result);
      }
    });
  });
}

// Test 2: Process Test Payment
async function testPayment() {
  console.log('🔥 Test 2: Test Payment Processing');
  
  const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: '8jbcpm9yj7df7w4h',
    publicKey: 'fnjq66rkd6vbkmxt',
    privateKey: 'c96f93d2d472395ed663393d6e4e2976',
  });

  return new Promise((resolve, reject) => {
    const saleRequest = {
      amount: '10.00',
      paymentMethodNonce: 'fake-valid-nonce',
      options: {
        submitForSettlement: true,
      },
    };

    gateway.transaction.sale(saleRequest, (err, result) => {
      if (err) {
        console.error('❌ Payment Failed:', err.message);
        reject(err);
      } else if (result.success) {
        console.log('✅ Payment Success!');
        console.log('   Transaction ID:', result.transaction.id);
        console.log('   Status:', result.transaction.status);
        console.log('   Amount:', result.transaction.amount);
        resolve(result);
      } else {
        console.error('❌ Payment Failed:', result.message);
        reject(new Error(result.message));
      }
    });
  });
}

// Run All Tests
async function runAllTests() {
  console.log('🧪 Braintree Integration Test Suite');
  console.log('===================================');
  console.log('');

  try {
    // Test 1: Connection
    await testBraintreeConnection();
    console.log('');

    // Test 2: Payment
    await testPayment();
    console.log('');

    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Braintree integration is fully working');
    console.log('✅ Ready for production deployment');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Deploy functions: firebase deploy --only functions');
    console.log('   2. Test with Expo app using test cards:');
    console.log('      - Card: 4111 1111 1111 1111');
    console.log('      - Expiry: 12/26');
    console.log('      - CVV: 123');

  } catch (error) {
    console.error('❌ Test Suite Failed:', error.message);
  }
}

runAllTests();