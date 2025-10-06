# Cloud Functions Deployment Instructions

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project initialized
3. Braintree credentials configured in environment variables

## Environment Setup

### 1. Configure Braintree Credentials

Set Firebase environment variables with your Braintree credentials:

```bash
firebase functions:config:set \
  braintree.merchant_id="YOUR_MERCHANT_ID" \
  braintree.public_key="YOUR_PUBLIC_KEY" \
  braintree.private_key="YOUR_PRIVATE_KEY"
```

### 2. Install Dependencies

Navigate to the functions directory and install dependencies:

```bash
cd functions
npm install
```

Required dependencies:
- firebase-admin: ^12.0.0
- firebase-functions: ^4.5.0
- express: ^4.18.2
- cors: ^2.8.5
- braintree: ^3.18.0

## Deployment

### 1. Build TypeScript

```bash
cd functions
npm run build
```

### 2. Deploy Functions

Deploy all functions:
```bash
firebase deploy --only functions
```

Deploy specific function:
```bash
firebase deploy --only functions:payments
firebase deploy --only functions:handlePaymentWebhook
firebase deploy --only functions:processPayouts
firebase deploy --only functions:generateInvoice
firebase deploy --only functions:recordUsageMetrics
```

## Update App Configuration

After deployment, update `config/env.ts` with your Cloud Functions URL:

```typescript
export const ENV = {
  API_URL: 'https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net',
  // ... other config
};
```

## Testing

### 1. Test Payment Endpoint

```bash
curl -X POST https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/payments/client-token \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'
```

### 2. Monitor Logs

```bash
firebase functions:log
```

## Scheduled Functions

The following functions run on schedule:
- `processPayouts`: Every Monday at 9:00 AM
- `recordUsageMetrics`: Daily at midnight

## Security Notes

1. Never commit credentials to version control
2. Use Firebase environment config for sensitive data
3. Enable Firebase App Check for production
4. Set up proper CORS policies
5. Implement rate limiting on client side

## Troubleshooting

### Function Deployment Fails

1. Check Node.js version (should be 18)
2. Verify all dependencies are installed
3. Check Firebase project permissions
4. Review function logs for errors

### Payment Processing Errors

1. Verify Braintree credentials are correct
2. Check Braintree sandbox/production environment
3. Review webhook configuration
4. Check function logs for detailed errors

## Production Checklist

- [ ] Braintree credentials configured
- [ ] Environment variables set
- [ ] Functions deployed successfully
- [ ] API_URL updated in app config
- [ ] Payment flow tested end-to-end
- [ ] Webhook endpoint configured in Braintree
- [ ] Monitoring and alerting set up
- [ ] Rate limiting implemented
- [ ] Error tracking configured
