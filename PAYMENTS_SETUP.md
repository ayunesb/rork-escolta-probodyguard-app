# Braintree Payment Setup Guide

## Overview

Escolta Pro uses **Braintree** (PayPal) as the payment provider for processing transactions in **MXN (Mexican Peso)**. This guide explains how to configure Braintree for sandbox and production environments.

---

## Prerequisites

1. **Braintree Account**: Sign up at [https://www.braintreepayments.com/](https://www.braintreepayments.com/)
2. **Merchant Account**: Create a merchant account in your Braintree dashboard
3. **API Credentials**: Obtain your Merchant ID, Public Key, and Private Key

---

## Environment Configuration

### Sandbox (Development/Testing)

1. Log in to your Braintree Sandbox account
2. Navigate to **Settings** → **API**
3. Copy your credentials:
   - Merchant ID
   - Public Key
   - Private Key
   - Tokenization Key (optional, for client-side)

4. Update `.env` file:

```env
# Braintree Configuration (Sandbox)
BRAINTREE_ENV=sandbox
BRAINTREE_MERCHANT_ID=your_sandbox_merchant_id
BRAINTREE_PUBLIC_KEY=your_sandbox_public_key
BRAINTREE_PRIVATE_KEY=your_sandbox_private_key
EXPO_PUBLIC_BRAINTREE_TOKENIZATION_KEY=your_sandbox_tokenization_key

# Payment Configuration
PAYMENTS_CURRENCY=MXN
```

### Production

1. Log in to your Braintree Production account
2. Navigate to **Settings** → **API**
3. Copy your production credentials
4. Update `.env` file:

```env
# Braintree Configuration (Production)
BRAINTREE_ENV=production
BRAINTREE_MERCHANT_ID=your_production_merchant_id
BRAINTREE_PUBLIC_KEY=your_production_public_key
BRAINTREE_PRIVATE_KEY=your_production_private_key
EXPO_PUBLIC_BRAINTREE_TOKENIZATION_KEY=your_production_tokenization_key

# Payment Configuration
PAYMENTS_CURRENCY=MXN
```

---

## Testing

### Sandbox Test Cards

Use these test card numbers in sandbox mode:

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa | 4111 1111 1111 1111 | 123 | Any future date |
| Mastercard | 5555 5555 5555 4444 | 123 | Any future date |
| Amex | 3782 822463 10005 | 1234 | Any future date |
| Discover | 6011 1111 1111 1117 | 123 | Any future date |

### Testing Scenarios

1. **Successful Payment**:
   - Use any test card above
   - Amount: Any positive number
   - Expected: Transaction succeeds, booking created

2. **Declined Payment**:
   - Use card: 4000 1111 1111 1115
   - Expected: Transaction fails with decline message

3. **Insufficient Funds**:
   - Use card: 4000 1111 1111 1123
   - Expected: Transaction fails with insufficient funds error

---

## Currency Configuration

All transactions are processed in **MXN (Mexican Peso)**. The currency is configured in:

1. **Backend**: `backend/config/env.ts`
   ```typescript
   export const PAYMENTS_CURRENCY = getEnvVar('PAYMENTS_CURRENCY') || 'MXN';
   ```

2. **Frontend**: All payment forms display amounts in MXN
   ```typescript
   currency="MXN"
   ```

3. **Database**: Payment records store `currency: 'MXN'`

---

## Payment Flow

### 1. Client Token Generation

```typescript
// Frontend requests a client token
const clientToken = await braintreeService.getClientToken(customerId);
```

### 2. Payment Form

```typescript
// User enters card details
<BraintreePaymentForm
  amount={totalAmount}
  currency="MXN"
  customerId={user?.id}
  bookingId={bookingId}
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

### 3. Payment Processing

```typescript
// Backend processes the payment
const result = await braintreeService.processPayment({
  nonce: paymentNonce,
  amount: totalAmount,
  currency: 'MXN',
  customerId: user?.id,
  bookingId: bookingId,
});
```

### 4. Payment Record

```typescript
// Payment record is created in Firestore
{
  transactionId: 'braintree_transaction_id',
  userId: 'user_id',
  bookingId: 'booking_id',
  amount: 1500.00,
  amountCents: 150000,
  currency: 'MXN',
  status: 'settled',
  platformFeeCents: 22500,  // 15%
  guardPayoutCents: 105000,  // 70%
  companyPayoutCents: 22500, // 15%
  createdAt: timestamp,
}
```

---

## Saved Cards (Vaulting)

Braintree supports saving payment methods for future use:

### First Payment
- User enters card details
- Payment is processed with `storeInVaultOnSuccess: true`
- Card is saved to customer's vault

### Subsequent Payments
- User selects saved card
- Payment is processed using saved payment method
- No card details required

---

## Refunds

### Processing a Refund

```typescript
const refund = await braintreeService.refundPayment({
  transactionId: 'original_transaction_id',
  amount: 1500.00, // Optional: partial refund
  reason: 'Customer requested refund',
});
```

### Refund Record

```typescript
{
  originalTransactionId: 'original_id',
  refundTransactionId: 'refund_id',
  amount: 1500.00,
  currency: 'MXN',
  reason: 'Customer requested refund',
  status: 'settled',
  createdAt: timestamp,
}
```

---

## Security Best Practices

1. **Never expose private keys**: Keep `BRAINTREE_PRIVATE_KEY` server-side only
2. **Use HTTPS**: All API calls must use HTTPS in production
3. **Validate amounts**: Always validate payment amounts on the server
4. **Log transactions**: Maintain audit logs for all payment operations
5. **PCI Compliance**: Braintree handles PCI compliance; never store raw card data

---

## Troubleshooting

### Common Issues

1. **"Braintree configuration is missing"**
   - Verify all environment variables are set
   - Restart the server after updating `.env`

2. **"Transaction failed"**
   - Check Braintree dashboard for error details
   - Verify merchant account is active
   - Ensure currency is supported (MXN)

3. **"Invalid nonce"**
   - Client token may have expired (regenerate)
   - Verify nonce is being passed correctly

### Debug Mode

Enable debug logging:

```typescript
console.log('[Braintree] Transaction details:', {
  amount,
  currency,
  customerId,
  transactionId,
});
```

---

## API Endpoints

### Client Token
- **Endpoint**: `POST /api/trpc/payments.braintree.clientToken`
- **Input**: `{ customerId?: string }`
- **Output**: `{ clientToken: string }`

### Checkout
- **Endpoint**: `POST /api/trpc/payments.braintree.checkout`
- **Input**: 
  ```typescript
  {
    nonce: string,
    amount: number,
    currency: string,
    customerId?: string,
    bookingId?: string,
    description?: string,
  }
  ```
- **Output**: 
  ```typescript
  {
    id: string,
    status: string,
    amount: number,
    currency: string,
    paymentRecordId: string,
  }
  ```

### Refund
- **Endpoint**: `POST /api/trpc/payments.braintree.refund`
- **Input**: 
  ```typescript
  {
    transactionId: string,
    amount?: number,
    reason?: string,
  }
  ```
- **Output**: 
  ```typescript
  {
    id: string,
    status: string,
    amount: number,
    currency: string,
    refundRecordId: string,
  }
  ```

---

## Migration from Stripe

All Stripe code has been removed. Key changes:

1. **Removed files**:
   - `services/stripeService.*`
   - `services/stripeInit.*`
   - `components/StripePaymentForm.*`

2. **Removed dependencies**:
   - `@stripe/stripe-react-native`
   - `@stripe/stripe-js`
   - `@stripe/react-stripe-js`

3. **New files**:
   - `services/braintreeService.ts`
   - `components/BraintreePaymentForm.tsx`
   - `backend/lib/braintree.ts`
   - `backend/trpc/routes/payments/braintree/*`

---

## Support

- **Braintree Documentation**: [https://developer.paypal.com/braintree/docs](https://developer.paypal.com/braintree/docs)
- **Braintree Support**: [https://www.braintreepayments.com/support](https://www.braintreepayments.com/support)
- **Sandbox Dashboard**: [https://sandbox.braintreegateway.com/](https://sandbox.braintreegateway.com/)
- **Production Dashboard**: [https://www.braintreegateway.com/](https://www.braintreegateway.com/)

---

## Quick Start Checklist

- [ ] Create Braintree sandbox account
- [ ] Obtain API credentials
- [ ] Update `.env` with sandbox credentials
- [ ] Test payment with test card
- [ ] Verify payment record in Firestore
- [ ] Test refund flow
- [ ] Create production account
- [ ] Update `.env` with production credentials
- [ ] Test in production with real card
- [ ] Monitor transactions in Braintree dashboard

---

**Last Updated**: 2025-01-03
**Version**: 1.0.0
