import axios from 'axios';

const BRAINTREE_GRAPHQL_URL = 'https://payments.sandbox.braintree-api.com/graphql';
const BRAINTREE_TOKEN = process.env.EXPO_PUBLIC_BRAINTREE_PRIVATE_KEY; // Use your API key here

export async function vaultTestPaymentMethod(nonce = 'fake-paypal-billing-agreement-nonce') {
  const query = `
    mutation VaultPayPal($input: VaultPaymentMethodInput!) {
      vaultPaymentMethod(input: $input) {
        paymentMethod {
          id
          usage
          details { ... on PayPalAccountDetails { email } }
        }
      }
    }
  `;
  const variables = { input: { id: nonce } };

  const { data } = await axios.post(
    BRAINTREE_GRAPHQL_URL,
    { query, variables },
    { headers: { Authorization: `Bearer ${BRAINTREE_TOKEN}`, 'Content-Type': 'application/json' } }
  );
  return data;
}

export async function chargeTestPayment(paymentMethodId = 'fake-valid-nonce', amount = '10.00') {
  const query = `
    mutation ChargeCreditCard($input: ChargePaymentMethodInput!) {
      chargePaymentMethod(input: $input) {
        transaction {
          status
          paymentMethodSnapshot {
            ... on CreditCardTransactionDetails {
              creditCard { brandCode bin last4 }
            }
          }
        }
      }
    }
  `;
  const variables = { input: { paymentMethodId, transaction: { amount } } };

  const { data } = await axios.post(
    BRAINTREE_GRAPHQL_URL,
    { query, variables },
    { headers: { Authorization: `Bearer ${BRAINTREE_TOKEN}`, 'Content-Type': 'application/json' } }
  );
  return data;
}
