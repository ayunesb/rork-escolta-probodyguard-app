# Cloud Functions Setup Instructions

## Installation

Navigate to the functions directory and install dependencies:

```bash
cd functions
npm install
```

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

## Local Testing

Start Firebase emulators:

```bash
npm run serve
```

## Deployment

Deploy to Firebase:

```bash
npm run deploy
```

## Environment Configuration

Set Braintree credentials:

```bash
firebase functions:config:set \
  braintree.merchant_id="YOUR_MERCHANT_ID" \
  braintree.public_key="YOUR_PUBLIC_KEY" \
  braintree.private_key="YOUR_PRIVATE_KEY"
```

View current config:

```bash
firebase functions:config:get
```

## Required Dependencies

- firebase-admin: ^12.0.0
- firebase-functions: ^4.5.0
- express: ^4.18.2
- cors: ^2.8.5
- braintree: ^3.19.0

## TypeScript Configuration

The functions directory has its own tsconfig.json with strict type checking enabled.
All implicit any types have been resolved with proper type annotations.

## Functions Deployed

1. **payments** - HTTP endpoint for payment operations
2. **handlePaymentWebhook** - Braintree webhook handler
3. **processPayouts** - Scheduled weekly payout processing
4. **generateInvoice** - Callable function for invoice generation
5. **recordUsageMetrics** - Daily Firebase usage tracking
