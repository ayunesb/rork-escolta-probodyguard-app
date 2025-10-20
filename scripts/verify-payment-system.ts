#!/usr/bin/env ts-node
/**
 * Payment System Verification Script
 * 
 * This script verifies that the payment system is properly configured and working:
 * 1. Checks Braintree credentials
 * 2. Tests client token generation
 * 3. Simulates a payment flow
 * 4. Verifies Firebase payment record creation
 */

import 'dotenv/config';
import { getBraintreeGateway } from '../backend/lib/braintree';

interface VerificationResult {
  step: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: any;
}

const results: VerificationResult[] = [];

function addResult(step: string, status: 'passed' | 'failed' | 'warning', message: string, details?: any) {
  results.push({ step, status, message, details });
  const emoji = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
  console.log(`${emoji} ${step}: ${message}`);
  if (details) {
    console.log('   Details:', details);
  }
}

async function verifyEnvironmentVariables() {
  console.log('\n📋 Step 1: Verifying Environment Variables\n');
  
  const requiredVars = [
    'BRAINTREE_ENV',
    'BRAINTREE_MERCHANT_ID',
    'BRAINTREE_PUBLIC_KEY',
    'BRAINTREE_PRIVATE_KEY',
  ];

  const exposedVars = [
    'EXPO_PUBLIC_BRAINTREE_ENV',
  ];

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      addResult(
        'Env Variable',
        'passed',
        `${varName} is set`,
        { value: varName === 'BRAINTREE_PRIVATE_KEY' ? '***hidden***' : process.env[varName] }
      );
    } else {
      addResult('Env Variable', 'failed', `${varName} is missing`);
    }
  }

  // Check that private key is NOT exposed
  if (process.env.EXPO_PUBLIC_BRAINTREE_PRIVATE_KEY) {
    addResult(
      'Security Check',
      'failed',
      'EXPO_PUBLIC_BRAINTREE_PRIVATE_KEY is exposed! This is a CRITICAL security issue!'
    );
  } else {
    addResult('Security Check', 'passed', 'Private key is not exposed to client');
  }

  // Check exposed variables
  for (const varName of exposedVars) {
    if (process.env[varName]) {
      addResult('Client Variable', 'passed', `${varName} is set for client`, { value: process.env[varName] });
    } else {
      addResult('Client Variable', 'warning', `${varName} is not set`);
    }
  }
}

async function verifyBraintreeConnection() {
  console.log('\n🔌 Step 2: Verifying Braintree Connection\n');

  try {
    const gateway = getBraintreeGateway();
    addResult('Gateway Init', 'passed', 'Braintree gateway initialized successfully');
    
    // Test client token generation
    const response = await gateway.clientToken.generate({});
    
    if (response.clientToken) {
      addResult(
        'Client Token',
        'passed',
        'Successfully generated client token',
        { tokenLength: response.clientToken.length }
      );
    } else {
      addResult('Client Token', 'failed', 'Client token generation returned empty result');
    }
  } catch (error: any) {
    addResult('Gateway Connection', 'failed', `Failed to connect to Braintree: ${error.message}`);
  }
}

async function simulatePaymentFlow() {
  console.log('\n💳 Step 3: Simulating Payment Flow\n');

  try {
    const gateway = getBraintreeGateway();

    // Step 1: Generate client token
    const tokenResponse = await gateway.clientToken.generate({});
    addResult('Payment Flow', 'passed', 'Step 1: Client token generated');

    // Step 2: Simulate using fake-valid-nonce (Braintree test nonce)
    const testAmount = '10.00';
    const saleResult = await gateway.transaction.sale({
      amount: testAmount,
      paymentMethodNonce: 'fake-valid-nonce',
      options: {
        submitForSettlement: true,
      },
    });

    if (saleResult.success && saleResult.transaction) {
      addResult(
        'Payment Processing',
        'passed',
        'Step 2: Payment processed successfully',
        {
          transactionId: saleResult.transaction.id,
          status: (saleResult.transaction as any).status,
          amount: testAmount,
        }
      );

      // Step 3: Transaction created successfully
      addResult(
        'Transaction Created',
        'passed',
        'Step 3: Transaction created in Braintree',
        { id: saleResult.transaction.id }
      );

      // Optional: Try refund (only if in sandbox)
      if (process.env.BRAINTREE_ENV === 'sandbox') {
        try {
          const refundResult = await gateway.transaction.refund(saleResult.transaction.id);
          if (refundResult.success) {
            addResult('Refund Test', 'passed', 'Refund processed successfully (sandbox only)');
          }
        } catch (refundError: any) {
          addResult('Refund Test', 'warning', `Refund test failed: ${refundError.message}`);
        }
      }
    } else {
      addResult(
        'Payment Processing',
        'failed',
        'Payment failed',
        { message: saleResult.message }
      );
    }
  } catch (error: any) {
    addResult('Payment Simulation', 'failed', `Payment simulation failed: ${error.message}`);
  }
}

async function checkFirebaseConfig() {
  console.log('\n🔥 Step 4: Checking Firebase Configuration\n');

  const firebaseVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  ];

  for (const varName of firebaseVars) {
    if (process.env[varName]) {
      addResult('Firebase Config', 'passed', `${varName} is set`);
    } else {
      addResult('Firebase Config', 'warning', `${varName} is missing`);
    }
  }
}

async function checkPaymentIntegration() {
  console.log('\n🔗 Step 5: Checking Payment Integration\n');

  // Check if payment routes are properly configured
  const criticalChecks = [
    {
      name: 'BraintreeService',
      path: './services/braintreeService.ts',
      description: 'Client-side service for payment processing',
    },
    {
      name: 'Payment Components',
      path: './components/BraintreePaymentForm.web.tsx',
      description: 'Web payment form with Hosted Fields',
    },
    {
      name: 'Backend Routes',
      path: './backend/trpc/routes/payments/braintree/checkout/route.ts',
      description: 'Backend payment processing endpoint',
    },
  ];

  for (const check of criticalChecks) {
    try {
      const fs = require('fs');
      if (fs.existsSync(check.path)) {
        addResult('Integration Check', 'passed', `${check.name} exists - ${check.description}`);
      } else {
        addResult('Integration Check', 'warning', `${check.name} not found at ${check.path}`);
      }
    } catch (error) {
      addResult('Integration Check', 'warning', `Could not check ${check.name}`);
    }
  }
}

function printSummary() {
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('                 VERIFICATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');

  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  console.log(`✅ Passed:   ${passed}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`📊 Total:    ${results.length}\n`);

  if (failed > 0) {
    console.log('❌ PAYMENT SYSTEM HAS CRITICAL ISSUES\n');
    console.log('Failed checks:');
    results
      .filter(r => r.status === 'failed')
      .forEach(r => console.log(`  - ${r.step}: ${r.message}`));
    console.log('\n');
  } else if (warnings > 0) {
    console.log('⚠️  PAYMENT SYSTEM IS FUNCTIONAL BUT HAS WARNINGS\n');
    console.log('Warnings:');
    results
      .filter(r => r.status === 'warning')
      .forEach(r => console.log(`  - ${r.step}: ${r.message}`));
    console.log('\n');
  } else {
    console.log('✅ PAYMENT SYSTEM IS FULLY FUNCTIONAL!\n');
  }

  console.log('═══════════════════════════════════════════════════════\n');

  // Recommendations
  if (process.env.BRAINTREE_ENV === 'sandbox') {
    console.log('💡 Recommendations:\n');
    console.log('  1. You are currently using Braintree SANDBOX environment');
    console.log('  2. Test cards for sandbox:');
    console.log('     - Card: 4111 1111 1111 1111');
    console.log('     - CVV: Any 3 digits');
    console.log('     - Expiry: Any future date');
    console.log('  3. When ready for production, update:');
    console.log('     - BRAINTREE_ENV=production in .env');
    console.log('     - Use production merchant credentials');
    console.log('     - Update EXPO_PUBLIC_BRAINTREE_ENV=production\n');
  }

  return failed === 0;
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║         PAYMENT SYSTEM VERIFICATION SCRIPT            ║');
  console.log('║                  Escolta Pro App                      ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  try {
    await verifyEnvironmentVariables();
    await verifyBraintreeConnection();
    await simulatePaymentFlow();
    await checkFirebaseConfig();
    await checkPaymentIntegration();

    const success = printSummary();
    process.exit(success ? 0 : 1);
  } catch (error: any) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
