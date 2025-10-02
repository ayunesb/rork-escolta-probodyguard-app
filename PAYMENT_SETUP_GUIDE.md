# Payment Setup Guide

## Current Issue

The payment is failing with "Failed to fetch" error because:
1. Backend URL is set to `localhost:8081` (won't work on mobile devices)
2. Stripe keys are not configured (still have placeholder values)

## Fix Steps

### 1. Get Stripe Test Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### 2. Update .env File

Open `.env` and update these lines:

```env
# Replace with your actual Stripe keys
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE

# Update backend URL based on your testing environment:
# For web testing: http://localhost:8081
# For mobile testing: http://YOUR_COMPUTER_IP:8081 (e.g., http://192.168.1.100:8081)
# For production: https://your-domain.com
EXPO_PUBLIC_TOOLKIT_URL=http://localhost:8081
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8081
```

### 3. Find Your Computer's IP Address (for mobile testing)

**On Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

Look for your local IP address (usually starts with 192.168.x.x or 10.0.x.x)

### 4. Restart the Development Server

After updating `.env`:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
bun run start
```

## Testing Payments

### Test Cards (Stripe Test Mode)

These cards work in test mode:

**Success:**
- `4242 4242 4242 4242` - Visa (succeeds)
- `5555 5555 5555 4444` - Mastercard (succeeds)

**Requires Authentication:**
- `4000 0025 0000 3155` - Requires 3D Secure

**Declined:**
- `4000 0000 0000 9995` - Declined (insufficient funds)
- `4000 0000 0000 0002` - Declined (generic)

**Card Details:**
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)
- Name: Any name

## Verify Setup

1. **Check backend is running:**
   ```bash
   curl http://localhost:8081/api/trpc/example.hi
   ```

2. **Check from mobile device (if testing on mobile):**
   ```bash
   curl http://YOUR_COMPUTER_IP:8081/api/trpc/example.hi
   ```

3. **Test payment flow:**
   - Sign in to the app
   - Book a guard
   - Use test card: `4242 4242 4242 4242`
   - Check Stripe Dashboard: https://dashboard.stripe.com/test/payments

## Common Issues

### "Failed to fetch" Error
- **Cause:** Backend URL is incorrect or backend is not running
- **Fix:** Update `EXPO_PUBLIC_RORK_API_BASE_URL` in `.env` and restart server

### "Invalid API Key" Error
- **Cause:** Stripe keys are not configured or incorrect
- **Fix:** Update Stripe keys in `.env` with real test keys from Stripe Dashboard

### Mobile Device Can't Connect
- **Cause:** Using `localhost` instead of computer's IP
- **Fix:** Replace `localhost` with your computer's local IP address (e.g., `192.168.1.100`)

### Firewall Blocking Connection
- **Cause:** Firewall blocking port 8081
- **Fix:** Allow port 8081 in your firewall settings

## Production Deployment

For production:
1. Use production Stripe keys (starts with `pk_live_` and `sk_live_`)
2. Use HTTPS for backend URL
3. Set up proper environment variables on your hosting platform
4. Enable Stripe webhooks for payment confirmations
5. Test thoroughly with real cards before going live

## Support

If issues persist:
1. Check console logs for detailed error messages
2. Verify backend is running: `bun run start`
3. Check network connectivity
4. Ensure Stripe keys are valid
5. Test with different cards
