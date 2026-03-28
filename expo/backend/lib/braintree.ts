import braintree from 'braintree';
import { BRAINTREE_ENV, BRAINTREE_MERCHANT_ID, BRAINTREE_PUBLIC_KEY, BRAINTREE_PRIVATE_KEY } from '../config/env';

let gateway: braintree.BraintreeGateway | null = null;

export function getBraintreeGateway(): braintree.BraintreeGateway {
  if (gateway) {
    return gateway;
  }

  if (!BRAINTREE_MERCHANT_ID || !BRAINTREE_PUBLIC_KEY || !BRAINTREE_PRIVATE_KEY) {
    console.error('[Braintree] Missing configuration. Using demo mode.');
    throw new Error('Braintree configuration is missing. Please set BRAINTREE_MERCHANT_ID, BRAINTREE_PUBLIC_KEY, and BRAINTREE_PRIVATE_KEY in .env');
  }

  const environment = BRAINTREE_ENV === 'production' 
    ? braintree.Environment.Production 
    : braintree.Environment.Sandbox;

  gateway = new braintree.BraintreeGateway({
    environment,
    merchantId: BRAINTREE_MERCHANT_ID,
    publicKey: BRAINTREE_PUBLIC_KEY,
    privateKey: BRAINTREE_PRIVATE_KEY,
  });

  console.log('[Braintree] Gateway initialized in', BRAINTREE_ENV, 'mode');
  return gateway;
}
