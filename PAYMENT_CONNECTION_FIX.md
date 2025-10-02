# Payment Connection Fix

## Issue
The payment system was showing "Failed to fetch" errors when trying to create payment intents.

## Root Causes
1. **Missing Authentication Headers**: The tRPC client wasn't sending Firebase authentication tokens
2. **Incorrect Endpoint Path**: The tRPC server endpoint path wasn't matching the client configuration
3. **CORS Configuration**: The backend needed proper CORS headers for cross-origin requests

## Fixes Applied

### 1. Added Authentication Headers to tRPC Client
**File**: `lib/trpc.ts`
- Added `getAuthHeaders()` function to extract Firebase ID token
- Configured both `trpcClient` and `trpcReactClient` to include auth headers
- Added detailed logging for debugging

### 2. Fixed Backend Middleware
**File**: `backend/trpc/middleware/auth.ts`
- Added JWT decoding function to extract user ID from Firebase tokens
- Properly validates and extracts `sub` or `user_id` from token payload
- Returns proper error messages for debugging

### 3. Updated Backend Configuration
**File**: `backend/hono.ts`
- Fixed tRPC endpoint path from `/trpc/*` to `/api/trpc/*`
- Enhanced CORS configuration with proper headers
- Added request/error logging middleware
- Added error handler to tRPC server

### 4. Enhanced Error Messages
**File**: `services/stripeService.web.ts`
- Added detailed error logging
- Improved error messages for network failures
- Added connection-specific error handling

## Testing the Fix

1. **Check Backend is Running**:
   - The backend runs automatically with `bun run start`
   - Check console for `[Backend]` logs

2. **Verify Authentication**:
   - Sign in to the app
   - Check console for `[tRPC Client]` logs showing auth headers

3. **Test Payment Flow**:
   - Create a booking
   - Proceed to payment
   - Check console for detailed logs at each step

## Expected Console Output

When payment works correctly, you should see:
```
[tRPC Client] Request to: http://localhost:8081/api/trpc
[tRPC Client] Headers: ['Authorization']
[tRPC Client] Fetching: http://localhost:8081/api/trpc/payments.createIntent
[Backend] POST http://localhost:8081/api/trpc/payments.createIntent
[Payment] Create intent: { bookingId: '...', amount: 10000 }
[Stripe Web] Payment intent created successfully
```

## Common Issues

### "Failed to fetch"
- **Cause**: Backend not running or wrong URL
- **Solution**: Verify `EXPO_PUBLIC_TOOLKIT_URL` in `.env` matches the running server

### "Not authenticated"
- **Cause**: User not signed in or token expired
- **Solution**: Sign out and sign in again to refresh token

### "PERMISSION_DENIED"
- **Cause**: Firestore security rules blocking access
- **Solution**: Check `firestore.rules` allows authenticated users to access their data

## Environment Variables

Ensure these are set in `.env`:
```
EXPO_PUBLIC_TOOLKIT_URL=http://localhost:8081
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8081
STRIPE_SECRET_KEY=sk_test_...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Next Steps

If payment still fails:
1. Check browser/app console for detailed error logs
2. Verify Firebase user is authenticated (`auth.currentUser`)
3. Test backend endpoint directly: `curl http://localhost:8081/api`
4. Check Stripe API keys are valid and not expired
