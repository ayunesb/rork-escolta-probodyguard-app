# How to Start the App

## The Issue
The error you're seeing happens because the tRPC API routes are returning HTML instead of JSON. This is a common issue with Expo Router API routes.

## Solution

### Option 1: Use the start script (Recommended)
```bash
bun run start
```

This should start the Expo development server with the backend API routes enabled.

### Option 2: If bunx is not found
If you get "bunx: command not found", try:

```bash
# Install bun globally first
curl -fsSL https://bun.sh/install | bash

# Then restart your terminal and run
bun run start
```

### Option 3: Use npx directly
```bash
npx expo start --tunnel
```

## Verify the Backend is Working

1. Once the app starts, open your browser to the URL shown (usually http://localhost:8081)
2. Test the health endpoint: http://localhost:8081/api/health
3. You should see: `{"status":"ok","message":"API is running","timestamp":"..."}`

## If You Still See Errors

The error "API endpoint returned HTML instead of JSON" means:
- The API routes are not being served correctly
- The app is trying to fetch from `/api/trpc` but getting the main HTML page instead

### Quick Fix:
1. Make sure you're running the app with `bun run start` or `npx expo start`
2. The API routes should be automatically available at `/api/*`
3. Check the console logs - you should see `[Backend]` and `[API Route]` messages

## Testing Payments (legacy Braintree notes archived)

This file previously included Braintree-specific testing steps and env var examples. Those legacy details have been archived to `docs/braintree-legacy.md`.

See: docs/braintree-legacy.md

## Common Issues

### "bunx: command not found"
- Install bun: `curl -fsSL https://bun.sh/install | bash`
- Or use npx: `npx expo start`

### "API endpoint returned HTML"
- The backend isn't running or routes aren't configured
- Make sure you're using the correct start command
- Check that `/api/health` returns JSON, not HTML

### Braintree errors
- Make sure you're in test mode (keys start with `pk_test_` and `sk_test_`)
- Check that the secret key is set in `.env`
- Verify the backend can access the Braintree API
