# Functions Installation Guide

## Step 1: Initialize package.json

Run this command in the `functions` directory:

```bash
cd functions
npm init -y
```

## Step 2: Install Dependencies

```bash
npm install firebase-admin@^12.0.0 firebase-functions@^4.5.0 express@^4.18.2 cors@^2.8.5 braintree@^3.19.0
```

## Step 3: Install Dev Dependencies

```bash
npm install --save-dev @types/express@^4.17.21 @types/cors@^2.8.17 typescript@^5.3.3 firebase-functions-test@^3.1.0
```

## Step 4: Update package.json scripts

Add these scripts to your package.json:

```json
{
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  }
}
```

## Step 5: Build

```bash
npm run build
```

## Step 6: Deploy

```bash
npm run deploy
```

## Environment Variables

The Braintree credentials are already configured in Rork's environment variables:
- BRAINTREE_MERCHANT_ID
- BRAINTREE_PUBLIC_KEY
- BRAINTREE_PRIVATE_KEY

These will be automatically available to your Cloud Functions when deployed.
