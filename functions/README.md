This folder contains Firebase Cloud Functions used by Escolta Pro.

Quick commands

- Build TypeScript:

```bash
cd functions
npm run build
```

- Run emulators (functions only):

```bash
cd functions
npm run serve
# or
npx firebase emulators:start --only functions,firestore,auth
```

- Run tests:

```bash
cd functions
npm test
```

Braintree / test-mode

- The functions use environment variables BRAINTREE_* for sandbox/production credentials.
- For local development you can enable test-mode by setting NODE_ENV=test or BRAINTREE_EMULATE_LOCAL=true. Test-mode will return mock client tokens and payment-method tokens when Braintree responses are missing.

API notes

- GET /payments/client-token?userId=:userId  — returns client token
- POST /payments/methods/:userId — vault a payment method (creates a payment method)
- GET /payments/methods/:userId — list vaulted payment methods for a user
- DELETE /payments/methods/:userId/:token — delete a vaulted payment method
- POST /webhooks/braintree — Braintree webhook receiver (writes to webhook_logs)

Testing against Braintree sandbox

- Use BRAINTREE_ENV=sandbox and your BRAINTREE_MERCHANT_ID, BRAINTREE_PUBLIC_KEY and BRAINTREE_PRIVATE_KEY environment variables.
- Integration tests in `__tests__` hit the local functions emulator; ensure the emulator is running before running tests.
