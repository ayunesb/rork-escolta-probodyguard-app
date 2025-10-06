# Cloud Functions Setup Required

## Problem
The `functions/src/index.ts` file has TypeScript errors because the Cloud Functions dependencies are not installed. This is a separate Node.js project from the main Expo app.

## Solution

You need to manually initialize and install dependencies in the `functions` directory:

### Step 1: Navigate to functions directory
```bash
cd functions
```

### Step 2: Initialize package.json (if not exists)
```bash
npm init -y
```

### Step 3: Install dependencies
```bash
npm install firebase-admin@^12.0.0 firebase-functions@^4.5.0 express@^4.18.2 cors@^2.8.5 braintree@^3.19.0
```

### Step 4: Install dev dependencies
```bash
npm install --save-dev @types/express@^4.17.21 @types/cors@^2.8.17 typescript@^5.3.3 firebase-functions-test@^3.1.0
```

### Step 5: Create tsconfig.json
Create `functions/tsconfig.json` with:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "outDir": "lib",
    "sourceMap": true,
    "strict": true,
    "target": "es2017",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "compileOnSave": true,
  "include": ["src"]
}
```

### Step 6: Update package.json scripts
Add these to your `functions/package.json`:
```json
{
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  }
}
```

### Step 7: Build
```bash
npm run build
```

### Step 8: Deploy to Firebase
```bash
npm run deploy
```

## Environment Variables

The Braintree credentials are already configured in Rork's environment:
- `BRAINTREE_MERCHANT_ID`
- `BRAINTREE_PUBLIC_KEY`
- `BRAINTREE_PRIVATE_KEY`

These will be automatically available to your deployed Cloud Functions.

## What the Functions Do

1. **api** - Express HTTP endpoint for payment operations:
   - POST `/client-token` - Generate Braintree client token
   - POST `/process` - Process payment with nonce
   - POST `/refund` - Process refund
   - GET `/methods/:userId` - Get saved payment methods
   - DELETE `/methods/:userId/:token` - Delete payment method

2. **handlePaymentWebhook** - Braintree webhook handler for payment status updates

3. **processPayouts** - Scheduled function (Mondays 9 AM) for weekly guard payouts

4. **generateInvoice** - Callable function to generate invoices for bookings

5. **recordUsageMetrics** - Daily Firebase usage tracking (midnight)

## After Deployment

Update `config/env.ts` in your main app to point to your deployed Cloud Functions URL:
```typescript
export const ENV = {
  API_URL: 'https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/api',
  // ... other config
};
```

## Why This Is Separate

Cloud Functions is a separate Node.js runtime environment from your Expo app. It needs its own:
- package.json
- node_modules
- tsconfig.json
- Build process

The main Expo app cannot install or manage these dependencies directly.
