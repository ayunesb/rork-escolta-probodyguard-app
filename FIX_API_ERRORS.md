# Fix: API endpoint returned HTML instead of JSON

## The Problem
You're seeing this error:
```
[tRPC Client] Response not OK or not JSON
[tRPC Client] Body preview: <!DOCTYPE html>
API endpoint returned HTML instead of JSON
```

This means the tRPC API routes are returning the main app HTML page instead of JSON responses.

## Root Cause
Expo Router API routes (`app/api/`) need to be properly configured and the app needs to be started correctly for them to work.

## Solution

### Step 1: Verify Your Environment
This guide previously included Braintree-specific env var examples and test instructions. Those legacy details have been moved to `docs/braintree-legacy.md`.

See: docs/braintree-legacy.md

### Step 2: Start the App Correctly

**Option A: Using Bun (Recommended)**
```bash
bun run start
```

**Option B: If bunx is not found**
```bash
# Install bun first
curl -fsSL https://bun.sh/install | bash

# Restart your terminal, then:
bun run start
```

**Option C: Using npx**
```bash
npx expo start --tunnel
```

### Step 3: Test the API Routes

Once the app starts, you should see console logs like:
```
[Backend] GET /api/health
[API Route GET] Request: /api/health
```

#### Test in Browser
1. Open http://localhost:8081/api/health
2. You should see JSON: `{"status":"ok","message":"API is running","timestamp":"..."}`
3. If you see HTML, the API routes are not working

#### Test in App
1. Navigate to the "API Test" screen (add `/api-test` to your URL)
2. Click "Test /api/health"
3. You should see a JSON response, not HTML

### Step 4: Check Console Logs

Look for these logs in your terminal:
- `[tRPC] Using window origin for web: http://localhost:8081`
- `[API Route POST] Request: /api/trpc/...`
- `[Backend] POST /api/trpc/...`

If you see these, the API is working correctly.

## Common Issues

### Issue 1: "bunx: command not found"
**Solution:** Install bun or use npx instead
```bash
curl -fsSL https://bun.sh/install | bash
# OR
npx expo start --tunnel
```

### Issue 2: API returns HTML on web
**Cause:** Expo Router is not serving API routes correctly
**Solution:** 
1. Make sure you're using Expo SDK 53+
2. Restart the dev server
3. Clear cache: `npx expo start --clear`

### Issue 3: Braintree payment fails
**Cause:** Backend can't access Braintree API or secret key is missing
**Solution:**
1. Verify `BRAINTREE_SECRET_KEY` is in `.env`
2. Check console for `[Env Config] BRAINTREE_SECRET_KEY available: true`
3. Make sure you're using test keys (start with `sk_test_`)

## Verification Checklist

- [ ] `.env` file has all required variables
- [ ] App started with `bun run start` or `npx expo start`
- [ ] `/api/health` returns JSON (not HTML)
- [ ] Console shows `[Backend]` and `[API Route]` logs
- [ ] tRPC requests show `Content-Type: application/json`
- [ ] No "<!DOCTYPE html>" in API responses

## Still Not Working?

If the API routes still return HTML:

1. **Check the file structure:**
   ```
   app/
     api/
       health+api.ts
       trpc/
         [...trpc]+api.ts
   ```

2. **Verify the API route files export the correct functions:**
   - `export async function GET(request: Request)`
   - `export async function POST(request: Request)`

3. **Check that Hono app is properly configured:**
   - `backend/hono.ts` should have routes for `/api/trpc/*`
   - CORS should be enabled

4. **Restart everything:**
   ```bash
   # Kill all processes
   pkill -f expo
   pkill -f node
   
   # Clear cache and restart
   npx expo start --clear --tunnel
   ```

## Testing Payments (legacy Braintree notes archived)

Legacy Braintree testing instructions were here and are now archived to `docs/braintree-legacy.md`.

See: docs/braintree-legacy.md

## Need More Help?

Check these files for debugging:
- `lib/trpc.ts` - tRPC client configuration
- `app/api/trpc/[...trpc]+api.ts` - API route handler
- `backend/hono.ts` - Backend server configuration
- Console logs in your terminal
