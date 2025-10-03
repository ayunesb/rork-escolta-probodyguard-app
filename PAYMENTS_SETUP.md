# Braintree Payment Setup Guide

## Overview

Escolta Pro uses **Braintree** (PayPal) for payment processing in **MXN (Mexican Pesos)**. This guide covers switching from sandbox to production and configuring the payment system.

---

## Current Configuration

- **Provider**: Braintree (PayPal)
- **Currency**: MXN (Mexican Pesos)
- **Environment**: Sandbox (for testing)
- **Features**:
  - Native Drop-in UI for iOS/Android
  - Card vaulting (saved cards)
  - One-tap payments
  - Refunds
  - Transaction history

---

## Sandbox Configuration

### Test Credentials

Current sandbox credentials are configured in `config/env.ts`:

```typescript
BRAINTREE_ENV: 'sandbox'
BRAINTREE_MERCHANT_ID: '8jbcpm9yj7df7w4h'
PAYMENTS_CURRENCY: 'MXN'
```

### Test Cards

Use these test cards in sandbox mode:

| Card Number         | Type       | Result  |
|---------------------|------------|---------|
| 4111 1111 1111 1111 | Visa       | Success |
| 5555 5555 5555 4444 | Mastercard | Success |
| 3782 822463 10005   | Amex       | Success |

- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3-4 digits (e.g., 123)

---

## Production Setup

### Step 1: Create Braintree Production Account

1. Go to [Braintree](https://www.braintreepayments.com/)
2. Sign up for a production account
3. Complete merchant verification (KYC)
4. Enable MXN currency support

### Step 2: Get Production Credentials

1. Log into Braintree Dashboard
2. Navigate to **Settings** → **API**
3. Copy your production credentials:
   - Merchant ID
   - Public Key
   - Private Key

### Step 3: Update Environment Configuration

Update `config/env.ts`:

```typescript
export const ENV = {
  BRAINTREE_ENV: 'production', // Change from 'sandbox'
  BRAINTREE_MERCHANT_ID: 'your_production_merchant_id',
  BRAINTREE_PUBLIC_KEY: 'your_production_public_key',
  BRAINTREE_PRIVATE_KEY: 'your_production_private_key',
  PAYMENTS_CURRENCY: 'MXN',
  API_URL: 'https://your-production-api.com',
};
```

### Step 4: Configure Expo Environment Variables

Create `.env.production`:

```bash
EXPO_PUBLIC_BRAINTREE_ENV=production
EXPO_PUBLIC_BRAINTREE_MERCHANT_ID=your_production_merchant_id
EXPO_PUBLIC_BRAINTREE_PUBLIC_KEY=your_production_public_key
EXPO_PUBLIC_BRAINTREE_PRIVATE_KEY=your_production_private_key
EXPO_PUBLIC_API_URL=https://your-production-api.com
```

Update `app.json`:

```json
{
  "expo": {
    "extra": {
      "braintreeEnv": "production",
      "braintreeMerchantId": "your_production_merchant_id",
      "braintreePublicKey": "your_production_public_key",
      "braintreePrivateKey": "your_production_private_key",
      "apiUrl": "https://your-production-api.com"
    }
  }
}
```

### Step 5: Update Backend Configuration

If you have a backend server, update its Braintree configuration:

```typescript
// backend/lib/braintree.ts
import braintree from 'braintree';

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Production, // Change from Sandbox
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});
```

---

## Payment Flow

### 1. Client Token Generation

```typescript
// Request client token from backend
const clientToken = await paymentService.getClientToken(customerId);
```

### 2. Payment Processing

```typescript
// Process payment with nonce
const result = await paymentService.processPayment(
  nonce,
  amount,
  customerId,
  saveCard
);
```

### 3. Card Vaulting

When `saveCard` is true and `customerId` is provided:
- Card is automatically vaulted in Braintree
- Saved to user's profile for future use
- Displayed in PaymentSheet for one-tap payments

---

## Fee Structure

Configured in `config/env.ts`:

```typescript
export const PAYMENT_CONFIG = {
  PROCESSING_FEE_PERCENT: 0.029,  // 2.9%
  PROCESSING_FEE_FIXED: 3.0,      // 3 MXN
  PLATFORM_CUT_PERCENT: 0.15,     // 15%
  MAX_BOOKING_DURATION: 8,        // hours
  MIN_BOOKING_DURATION: 1,        // hours
};
```

### Calculation Example

For a 500 MXN booking:
- **Service**: 500 MXN
- **Processing Fee**: (500 × 0.029) + 3 = 17.50 MXN
- **Total Charged**: 517.50 MXN
- **Platform Cut**: 500 × 0.15 = 75 MXN
- **Guard Payout**: 500 - 75 = 425 MXN

---

## Security Best Practices

### 1. Never Expose Private Keys

- Store private keys in environment variables
- Never commit keys to version control
- Use different keys for sandbox/production

### 2. Validate on Backend

- Always validate payment amounts on backend
- Never trust client-side calculations
- Verify transaction status before confirming bookings

### 3. PCI Compliance

- Braintree handles PCI compliance
- Never store raw card numbers
- Use tokens for saved cards

---

## Testing Checklist

Before going to production:

- [ ] Test successful payments
- [ ] Test declined cards
- [ ] Test card vaulting (save card)
- [ ] Test one-tap payments with saved cards
- [ ] Test refunds
- [ ] Verify MXN currency display
- [ ] Test payment breakdown calculations
- [ ] Verify booking creation after payment
- [ ] Test error handling
- [ ] Verify transaction records

---

## Troubleshooting

### Payment Fails with "Invalid Merchant"

- Verify merchant ID is correct
- Check environment (sandbox vs production)
- Ensure API keys match the environment

### Card Vaulting Not Working

- Verify `customerId` is provided
- Check `saveCard` flag is true
- Ensure customer exists in Braintree

### Currency Issues

- Verify `PAYMENTS_CURRENCY` is set to 'MXN'
- Check Braintree account has MXN enabled
- Ensure amounts are in MXN (not USD)

---

## Support

- **Braintree Docs**: https://developer.paypal.com/braintree/docs
- **Support**: https://www.braintreepayments.com/support
- **Status**: https://status.braintreepayments.com/

---

## Migration Checklist

When switching from sandbox to production:

1. [ ] Create production Braintree account
2. [ ] Complete merchant verification
3. [ ] Enable MXN currency
4. [ ] Get production API credentials
5. [ ] Update `config/env.ts`
6. [ ] Update `app.json` extra config
7. [ ] Update backend configuration
8. [ ] Test in production environment
9. [ ] Monitor first transactions
10. [ ] Set up webhook notifications (optional)

---

**Last Updated**: 2025-01-03
