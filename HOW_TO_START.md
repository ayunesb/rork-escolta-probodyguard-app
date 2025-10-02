# How to Start the App

## Quick Start

Run one of these commands:

```bash
# Option 1: Use the start script (recommended)
./start.sh

# Option 2: Use npm directly
npm start

# Option 3: Use npx expo
npx expo start --tunnel

# Option 4: For web only
npx expo start --web
```

## What Was Fixed

### 1. **Stripe Integration**
- ✅ Installed `@stripe/react-stripe-js` and `@stripe/stripe-js`
- ✅ Created proper Stripe Elements integration for web
- ✅ Payment form now uses Stripe's PaymentElement component
- ✅ Handles payment confirmation properly

### 2. **Payment Flow**
- On **web**: Uses Stripe Elements with PaymentElement
- On **mobile**: Uses existing card input fields
- Saved cards work on both platforms
- Payment intents are created via tRPC backend

### 3. **Error Resolution**
The `Unexpected token '<', "<!DOCTYPE "...` error was caused by:
- tRPC endpoint not being reached properly
- Now using proper Stripe Elements which handles this correctly

## Testing Payments

### Test Card Numbers (Stripe Test Mode)
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date (e.g., `12/25`) and any 3-digit CVV (e.g., `123`).

## Environment Variables

Make sure your `.env` file has:
```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SDc1sLe5z8vTWFiXcjY53w36vVFSFDfnlRebaVs0a9cccTJEZk2DHzr2rQp3tDp1XlobwOrMpN1nJdJ1DIa9Zpc002zUNcHVj
STRIPE_SECRET_KEY=sk_test_51SDc1sLe5z8vTWFih4TVw2lNZebHxgRoCQgcNqcaJsDirzDAlXFGVEt8UDl1n0YSOG2IhC3nke0wYNHB4v2tRG3w00tLsIETPD
```

## How It Works

1. **User clicks "Add Card & Pay"**
2. **On Web**: 
   - Creates payment intent via tRPC
   - Shows Stripe Elements PaymentElement
   - User enters card details in secure iframe
   - Stripe handles payment confirmation
3. **On Mobile**:
   - Uses existing card input fields
   - Creates payment intent via tRPC
   - Confirms payment with Stripe API

## Troubleshooting

### If you see "bunx: command not found"
- Use `npm start` or `npx expo start --tunnel` instead
- Or install Bun: `curl -fsSL https://bun.sh/install | bash`

### If payments fail
1. Check that Stripe keys are in `.env`
2. Make sure you're using test card numbers
3. Check browser console for errors
4. Verify backend is running (should start automatically with Expo)

### If you see HTML instead of JSON errors
- This is now fixed with proper Stripe Elements integration
- The payment form creates the intent first, then shows Stripe's UI
