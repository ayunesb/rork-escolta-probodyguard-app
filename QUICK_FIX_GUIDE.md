# Quick Fix Guide - API Errors

## The Error You're Seeing
```
API endpoint returned HTML instead of JSON
```

## Quick Fix (3 Steps)

### 1. Stop Everything
```bash
pkill -f expo
pkill -f node
```

### 2. Start Fresh
```bash
bun run start
```

**If "bunx: command not found":**
```bash
npx expo start --tunnel
```

### 3. Test It Works
Open in browser: http://localhost:8081/api/health

**✅ Should see:**
```json
{"status":"ok","message":"API is running","timestamp":"..."}
```

**❌ If you see HTML:** The API routes aren't working. Try:
```bash
npx expo start --clear --tunnel
```

## Payment testing (legacy Braintree notes archived)

This document previously contained legacy Braintree testing instructions. Those details have been archived to `docs/braintree-legacy.md`.

If you need historical Braintree testing steps, see: docs/braintree-legacy.md

## Still Not Working?

### Check Console Logs
Look for:
- ✅ `[API Route POST] Response content-type: application/json`
- ❌ `[tRPC Client] Body preview: <!DOCTYPE html>`

### Check Environment
Make sure `.env` has:
```
BRAINTREE_SECRET_KEY=sk_test_<REDACTED>
EXPO_PUBLIC_BRAINTREE_PUBLISHABLE_KEY=pk_test_<REDACTED>
EXPO_PUBLIC_API_URL=http://localhost:8081
```

### Nuclear Option
```bash
# Kill everything
pkill -f expo
pkill -f node
pkill -f bun

# Clear all caches
rm -rf node_modules/.cache
rm -rf .expo

# Restart
npx expo start --clear --tunnel
```

## What I Fixed

1. ✅ Updated tRPC client to use correct API URL
2. ✅ Improved error messages
3. ✅ Added better logging
4. ✅ Fixed API route handlers
5. ✅ Updated environment variables

## Files Changed

- `lib/trpc.ts` - tRPC client config
- `app/api/trpc/[...trpc]+api.ts` - API route handler
- `.env` - Environment variables

## More Help

- **Detailed guide:** See `FIX_API_ERRORS.md`
- **Full status:** See `CURRENT_STATUS.md`
- **Test page:** Navigate to `/api-test` in the app
