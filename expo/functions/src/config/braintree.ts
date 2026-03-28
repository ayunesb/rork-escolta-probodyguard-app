/**
 * Braintree Gateway Configuration
 * 
 * SECURITY: This file retrieves Braintree credentials from environment variables
 * which should ONLY be set in Firebase Functions runtime config, never committed to git.
 * 
 * Setup:
 * firebase functions:config:set \
 *   braintree.merchant_id="YOUR_MERCHANT_ID" \
 *   braintree.public_key="YOUR_PUBLIC_KEY" \
 *   braintree.private_key="YOUR_PRIVATE_KEY" \
 *   braintree.environment="sandbox"
 * 
 * Verify:
 * firebase functions:config:get
 * 
 * Official Documentation:
 * - https://developer.paypal.com/braintree/docs/reference/overview
 * - https://firebase.google.com/docs/functions/config-env
 */

import * as braintree from 'braintree';
import { logger } from 'firebase-functions/v2';

/**
 * Initialize Braintree Gateway with environment variables
 * Falls back to process.env for local development/testing
 */
function initializeBraintreeGateway(): braintree.BraintreeGateway | null {
  // Read from environment variables (set via Firebase Functions config)
  const merchantId = process.env.BRAINTREE_MERCHANT_ID;
  const publicKey = process.env.BRAINTREE_PUBLIC_KEY;
  const privateKey = process.env.BRAINTREE_PRIVATE_KEY;
  const environment = process.env.BRAINTREE_ENV || 'sandbox';

  // Validate all required credentials are present
  if (!merchantId || !publicKey || !privateKey) {
    logger.error('[Braintree] Missing credentials. Functions will return errors until configured.');
    logger.error('[Braintree] Required: BRAINTREE_MERCHANT_ID, BRAINTREE_PUBLIC_KEY, BRAINTREE_PRIVATE_KEY');
    logger.error('[Braintree] Set via: firebase functions:config:set braintree.merchant_id="xxx" ...');
    return null;
  }

  // Select environment (Production or Sandbox)
  const braintreeEnvironment = environment === 'production'
    ? braintree.Environment.Production
    : braintree.Environment.Sandbox;

  logger.info('[Braintree] Initializing gateway', {
    environment,
    merchantId,
    publicKey: publicKey.substring(0, 8) + '...',
    privateKey: '***REDACTED***'
  });

  // Initialize gateway
  const gateway = new braintree.BraintreeGateway({
    environment: braintreeEnvironment,
    merchantId,
    publicKey,
    privateKey,
  });

  logger.info('[Braintree] Gateway initialized successfully');
  return gateway;
}

// Export singleton gateway instance
export const gateway = initializeBraintreeGateway();

// Export helper to check if gateway is configured
export function isGatewayConfigured(): boolean {
  return gateway !== null;
}

// Export error response for unconfigured gateway
export function getConfigurationError() {
  return {
    error: {
      code: 'PAYMENT_CONFIG_ERROR',
      message: 'Payment system is not properly configured. Please contact support.',
      details: 'Braintree credentials are missing or invalid.'
    }
  };
}
