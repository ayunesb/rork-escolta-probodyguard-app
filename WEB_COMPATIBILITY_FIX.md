# Web Compatibility Fix - Stripe Integration

## Problem
The app was crashing on web with the error:
```
ERROR Error: Importing native-only module "react-native/Libraries/Utilities/codegenNativeCommands" on web
```

This occurred because `@stripe/stripe-react-native` is a native-only package that cannot run on web.

## Solution
Created platform-specific implementations of the Stripe service:

### Files Created
1. **`services/stripeService.native.ts`** - Native implementation (iOS/Android)
   - Uses `@stripe/stripe-react-native` package
   - Implements native payment sheet
   - Full Stripe SDK integration

2. **`services/stripeService.web.ts`** - Web implementation
   - Web-compatible fallback
   - No native dependencies
   - Simulates payment flow for web testing

3. **`services/stripeService.d.ts`** - TypeScript definitions
   - Shared type definitions
   - Ensures type safety across platforms

### How It Works
React Native's Metro bundler automatically selects the correct file based on platform:
- On iOS/Android: Uses `stripeService.native.ts`
- On Web: Uses `stripeService.web.ts`
- TypeScript: Uses `stripeService.d.ts` for type checking

### Usage
Import the service normally - the platform-specific version is loaded automatically:

```typescript
import * as stripeService from '@/services/stripeService';

// Create payment intent (works on all platforms)
const paymentIntent = await stripeService.createPaymentIntent(bookingId, amount);

// Confirm payment
// - On native: Shows Stripe payment sheet
// - On web: Returns success (for testing)
const result = await stripeService.confirmPayment(paymentIntent.clientSecret);
```

### Files Updated
- `app/booking-payment.tsx` - Updated to use new import pattern
- `SUMMARY.md` - Updated documentation

### Testing
The app now works on:
- ✅ iOS (native Stripe integration)
- ✅ Android (native Stripe integration)
- ✅ Web (fallback implementation)

### Production Notes
For production web deployment, you would need to:
1. Integrate Stripe.js or Stripe Elements for web
2. Implement proper card input UI for web
3. Handle 3D Secure authentication on web

The current web implementation is a testing fallback that allows the app to run without crashing.

## Related Files
- `services/stripeService.native.ts`
- `services/stripeService.web.ts`
- `services/stripeService.d.ts`
- `app/booking-payment.tsx`
- `backend/trpc/routes/payments/create-intent/route.ts`
- `backend/trpc/routes/payments/refund/route.ts`
