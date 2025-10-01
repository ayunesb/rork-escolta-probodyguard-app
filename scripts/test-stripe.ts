#!/usr/bin/env bun

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('your_secret_key')) {
  console.error('❌ Stripe secret key not configured');
  console.log('\n📝 To test Stripe:');
  console.log('1. Get your test keys from https://dashboard.stripe.com/test/apikeys');
  console.log('2. Update .env file with your keys');
  console.log('3. Run this script again\n');
  process.exit(1);
}

console.log('🔍 Testing Stripe Integration...\n');

async function testCreatePaymentIntent() {
  console.log('1️⃣ Testing Payment Intent Creation...');
  
  try {
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: '10000',
        currency: 'usd',
        'metadata[bookingId]': 'test-booking-123',
        'automatic_payment_methods[enabled]': 'true',
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create payment intent');
    }

    const paymentIntent = await response.json();
    console.log('✅ Payment Intent Created:', paymentIntent.id);
    console.log('   Amount: $' + (paymentIntent.amount / 100).toFixed(2));
    console.log('   Status:', paymentIntent.status);
    
    return paymentIntent.id;
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    throw error;
  }
}

async function testRetrievePaymentIntent(paymentIntentId: string) {
  console.log('\n2️⃣ Testing Payment Intent Retrieval...');
  
  try {
    const response = await fetch(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to retrieve payment intent');
    }

    const paymentIntent = await response.json();
    console.log('✅ Payment Intent Retrieved:', paymentIntent.id);
    console.log('   Status:', paymentIntent.status);
    console.log('   Metadata:', paymentIntent.metadata);
    
    return paymentIntent;
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    throw error;
  }
}

async function testCancelPaymentIntent(paymentIntentId: string) {
  console.log('\n3️⃣ Testing Payment Intent Cancellation...');
  
  try {
    const response = await fetch(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to cancel payment intent');
    }

    const paymentIntent = await response.json();
    console.log('✅ Payment Intent Canceled:', paymentIntent.id);
    console.log('   Status:', paymentIntent.status);
    
    return paymentIntent;
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    throw error;
  }
}

async function runTests() {
  try {
    const paymentIntentId = await testCreatePaymentIntent();
    await testRetrievePaymentIntent(paymentIntentId);
    await testCancelPaymentIntent(paymentIntentId);
    
    console.log('\n✅ All Stripe tests passed!\n');
    console.log('📱 Next steps:');
    console.log('1. Open the app');
    console.log('2. Sign in with: client@test.com / Test123!');
    console.log('3. Book a guard');
    console.log('4. Use test card: 4242 4242 4242 4242');
    console.log('5. Check Stripe Dashboard: https://dashboard.stripe.com/test/payments\n');
  } catch {
    console.error('\n❌ Stripe tests failed');
    process.exit(1);
  }
}

runTests();
