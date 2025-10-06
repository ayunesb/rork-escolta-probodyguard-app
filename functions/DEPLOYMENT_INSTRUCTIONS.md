# Cloud Functions Deployment Instructions

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project initialized
3. Braintree account with MXN merchant account

## Installation

Navigate to functions directory and install dependencies:

```bash
cd functions
npm install
```

Required dependencies:
- firebase-admin@^12.0.0
- firebase-functions@^5.0.0
- express@^4.18.2
- cors@^2.8.5
- braintree@^3.20.0

Dev dependencies:
- @types/express@^4.17.21
- @types/cors@^2.8.17
- typescript@^5.3.3

## Configuration

Set Firebase config for Braintree:

```bash
firebase functions:config:set \
  braintree.merchant_id="YOUR_MERCHANT_ID" \
  braintree.public_key="YOUR_PUBLIC_KEY" \
  braintree.private_key="YOUR_PRIVATE_KEY"
```

## Build

```bash
npm run build
```

## Deploy

Deploy all functions:
```bash
firebase deploy --only functions
```

Deploy specific function:
```bash
firebase deploy --only functions:payments
```

## Functions Deployed

1. **payments** - Express app handling payment operations
   - POST /client-token - Generate Braintree client token
   - POST /process - Process payment with nonce
   - POST /refund - Process refund
   - GET /methods/:userId - Get saved payment methods
   - DELETE /methods/:userId/:token - Delete payment method

2. **handlePaymentWebhook** - Braintree webhook handler

3. **processPayouts** - Scheduled function (every Monday 9:00 AM)
   - Processes pending guard payouts

4. **generateInvoice** - Callable function
   - Generates CFDI-compliant invoice for booking

5. **recordUsageMetrics** - Scheduled function (daily midnight)
   - Records Firebase usage metrics

## Testing

Local emulator:
```bash
npm run serve
```

## Production Checklist

- [ ] Set production Braintree credentials
- [ ] Configure MXN merchant account
- [ ] Set up webhook URL in Braintree dashboard
- [ ] Enable required Firebase services (Firestore, Storage, Auth)
- [ ] Set up monitoring and alerts
- [ ] Test all payment flows in sandbox
- [ ] Verify 3DS2 authentication
- [ ] Test refund processing
- [ ] Verify payout scheduling
