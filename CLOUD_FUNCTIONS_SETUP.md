# Cloud Functions Setup Instructions

## Installation

Navigate to the functions directory and install dependencies:

```bash
cd functions
npm install
cd ..
```

## Configuration

Set Firebase environment variables for Braintree:

```bash
firebase functions:config:set \
  braintree.merchant_id="YOUR_MERCHANT_ID" \
  braintree.public_key="YOUR_PUBLIC_KEY" \
  braintree.private_key="YOUR_PRIVATE_KEY"
```

## Build

```bash
cd functions
npm run build
```

## Deploy

```bash
firebase deploy --only functions
```

## Local Testing

```bash
cd functions
npm run serve
```

## Functions Deployed

1. **payments** - Express app handling payment operations
   - POST /client-token - Generate Braintree client token
   - POST /checkout - Process new payment
   - POST /refund - Process refund
   - POST /vault-card - Save card to vault
   - POST /checkout-vaulted - Charge saved card
   - POST /payment-webhook - Braintree webhook handler

2. **handlePaymentWebhook** - Process payment status updates

3. **processPayouts** - Weekly guard payout processing (Mondays 9 AM)

4. **generateInvoice** - Generate CFDI-compliant invoices

5. **monitorCosts** - Daily Firebase usage monitoring

## Environment Variables Required

- `braintree.merchant_id`
- `braintree.public_key`
- `braintree.private_key`

## Notes

- All functions use TypeScript with strict type checking
- Payment processing uses Braintree SDK for MXN
- Webhooks validate signatures before processing
- Cost monitoring alerts at 80% threshold
- Payouts run weekly with automatic retry logic
