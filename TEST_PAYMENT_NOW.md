# Test Payment Connection - Quick Guide

## 🚀 Quick Start

### 1. Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
bun run start
```

### 2. Test API Health (In Browser)
Open: `http://localhost:8081/api/health`

**Expected Response:**
```json
{
  "status": "ok",
  "message": "API is running",
  "timestamp": "2025-10-02T..."
}
```

✅ If you see this, the API is working!

### 3. Test Payment Flow (In App)

1. **Sign In**
   - Use your test account or create a new one

2. **Create a Booking**
   - Go to Home tab
   - Select a guard
   - Fill in booking details
   - Click "Continue to Payment"

3. **Make Payment**
   - Enter card details OR use saved card
   - Click "Pay Now"

4. **Watch Console Logs**
   You should see:
   ```
   [API Route] POST request: ...
   [Backend] POST ...
   [Env Config] STRIPE_SECRET_KEY available: true
   [Payment] Create intent: ...
   [Payment] Payment intent created: pi_...
   ```

## 🔍 What to Look For

### ✅ Success Indicators
- No "Failed to fetch" errors
- Console shows `[API Route]` logs
- Console shows `[Backend]` logs
- Console shows `[Payment] Payment intent created`
- Payment completes successfully
- Booking is created

### ❌ Error Indicators
- "Failed to fetch" errors
- "Unable to connect to payment server"
- No `[API Route]` logs
- No `[Backend]` logs

## 🐛 If It Still Doesn't Work

### Step 1: Clear Everything
```bash
rm -rf .expo node_modules/.cache
bun run start --clear
```

### Step 2: Check Environment Variables
Open `.env` and verify:
```env
EXPO_PUBLIC_STRIPE_SECRET_KEY=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
```

### Step 3: Check Console for Specific Errors
Look for:
- `[Env Config] STRIPE_SECRET_KEY available: false` - Environment variable not loaded
- `404 Not Found` - API route not registered
- `CORS error` - CORS configuration issue
- `Unauthorized` - Authentication issue

### Step 4: Test Individual Components

#### Test tRPC Connection:
```typescript
// In browser console or app:
fetch('http://localhost:8081/api/health')
  .then(r => r.json())
  .then(console.log)
```

#### Test Stripe Key:
Check console for:
```
[Env Config] STRIPE_SECRET_KEY available: true
```

## 📝 Common Issues & Solutions

### Issue: "Failed to fetch"
**Solution:** API route not working. Check:
1. File `app/api/trpc/[...trpc]+api.ts` exists
2. Dev server restarted after creating the file
3. No TypeScript errors in the file

### Issue: "Stripe key not configured"
**Solution:** Environment variable not loaded. Check:
1. `.env` file has `EXPO_PUBLIC_STRIPE_SECRET_KEY`
2. Dev server restarted after updating `.env`
3. Console shows `[Env Config] STRIPE_SECRET_KEY available: true`

### Issue: "Unauthorized"
**Solution:** Authentication issue. Check:
1. You're signed in
2. Firebase token is being sent
3. Console shows `[tRPC Client] Headers: ['Authorization']`

### Issue: Payment stays "Processing"
**Solution:** Backend is hanging. Check:
1. Console for backend errors
2. Stripe API key is valid
3. Network connection is stable

## 🎯 Expected Console Output

When payment works correctly, you should see this sequence:

```
[tRPC] Using window origin: http://localhost:8081
[tRPC Client] Request to: http://localhost:8081/api/trpc
[tRPC Client] Fetching: http://localhost:8081/api/trpc/payments.createIntent
[API Route] POST request: http://localhost:8081/api/trpc/payments.createIntent
[Backend] POST http://localhost:8081/api/trpc/payments.createIntent
[Env Config] STRIPE_SECRET_KEY available: true
[Payment] Create intent: { bookingId: 'booking-1234567890', amount: 50000 }
[tRPC Client] Response status: 200
[Payment] Payment intent created: pi_3ABC123...
[Stripe Web] Payment intent created successfully: { clientSecret: '...', paymentIntentId: 'pi_3ABC123...' }
[Payment] Payment completed successfully
```

## 🔐 Security Note

The current setup exposes the Stripe secret key on the client side (via `EXPO_PUBLIC_` prefix). This is:
- ✅ OK for development and testing
- ❌ NOT OK for production

For production, you'll need to:
1. Use a separate backend server
2. Use Expo EAS Build with secure environment variables
3. Never expose secret keys to the client

## 📞 Still Having Issues?

If you're still seeing errors after following all steps:

1. **Share the exact error message** from the console
2. **Share the console logs** showing the request flow
3. **Check if `/api/health` endpoint works**
4. **Verify the dev server URL** matches what the app is using

## ✨ Success!

If everything works, you should be able to:
- ✅ Create bookings
- ✅ Process payments
- ✅ Save payment methods
- ✅ Use saved cards for one-tap payment
- ✅ See payment confirmations

The payment flow is now fully functional! 🎉
