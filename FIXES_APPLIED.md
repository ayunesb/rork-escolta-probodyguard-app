# Fixes Applied - Infinite Loop Resolution

## Date: 2025-10-03

## Problem Analysis

### Root Cause
The app was stuck in an infinite loop caused by:

1. **Navigation Loop in `app/_layout.tsx`**:
   - `RootLayoutNav` had a `useEffect` that triggered navigation based on auth state
   - When user logged in, `setRole(user.role)` was called in the same component
   - `setRole` was in the dependency array of the navigation `useEffect`
   - This caused: Navigation → segments change → useEffect runs → setRole called → navigation triggered again → infinite loop

2. **Circular Dependency**:
   - `LocationTrackingContext.setRole` was being called from `_layout.tsx`
   - `setRole` was in the dependency array of the navigation effect
   - Every navigation triggered a role update, which triggered navigation again

3. **Complex Navigation Logic**:
   - Multiple refs tracking navigation state
   - `setTimeout` delays that didn't prevent the loop
   - Route tracking that changed on every render

## Solutions Applied

### 1. Simplified Navigation Logic (`app/_layout.tsx`)
**Changes:**
- Removed `setRole` call from `RootLayoutNav` component
- Simplified navigation logic to use a single `hasNavigated` ref
- Removed unnecessary route tracking and `setTimeout` delays
- Fixed dependency array to include `router`

**Before:**
```typescript
const navigationHandledRef = useRef(false);
const lastRouteRef = useRef<string>('');

useEffect(() => {
  if (user) {
    setRole(user.role);  // ❌ This caused the loop
  } else {
    setRole(null);
  }
}, [user, setRole]);  // ❌ setRole in deps caused re-renders

useEffect(() => {
  // Complex navigation logic with setTimeout
  if (currentRoute !== lastRouteRef.current) {
    navigationHandledRef.current = false;
    lastRouteRef.current = currentRoute;
  }
  // ... navigation with setTimeout
}, [user, isLoading, segments, router]);
```

**After:**
```typescript
const hasNavigated = useRef(false);

useEffect(() => {
  if (isLoading) return;

  const inAuthGroup = segments[0] === 'auth';
  const inTabsGroup = segments[0] === '(tabs)';

  if (!user && !inAuthGroup) {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      router.replace('/auth/sign-in');
    }
  } else if (user && !inTabsGroup && !inAuthGroup) {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      router.replace('/(tabs)/home');
    }
  }
}, [user, isLoading, segments, router]);
```

### 2. Moved Role Initialization (`app/(tabs)/_layout.tsx`)
**Changes:**
- Moved `setRole` call to the tabs layout where it's actually needed
- This ensures role is set only when user enters the tabs, not during navigation

**Added:**
```typescript
const { setRole } = useLocationTracking();

useEffect(() => {
  if (user) {
    setRole(user.role);
  }
}, [user, setRole]);
```

### 3. Improved Location Context (`contexts/LocationTrackingContext.tsx`)
**Changes:**
- Added `roleSetRef` to prevent unnecessary role updates
- Added early return in `setRole` if role hasn't changed
- Updated roles requiring location to include 'company' (as per user requirements)

**Before:**
```typescript
const ROLES_REQUIRING_LOCATION: UserRole[] = ['client', 'guard'];

const setRole = useCallback((role: UserRole | null) => {
  console.log('[Location] Setting user role:', role);
  setUserRole(role);
}, []);
```

**After:**
```typescript
const ROLES_REQUIRING_LOCATION: UserRole[] = ['client', 'guard', 'company'];

const roleSetRef = useRef<boolean>(false);

const setRole = useCallback((role: UserRole | null) => {
  if (roleSetRef.current && userRole === role) return;  // ✅ Prevent unnecessary updates
  console.log('[Location] Setting user role:', role);
  setUserRole(role);
  roleSetRef.current = true;
}, [userRole]);
```

## Location Requirements by Role

Based on the user's requirements:
- ✅ **Client**: Requires location (to book guards, see nearby guards)
- ✅ **Guard**: Requires location (to be found by clients, track during jobs)
- ✅ **Company**: Requires location (to manage guard locations)
- ❌ **Admin**: Does NOT require location (administrative role only)

## Testing Checklist

After these fixes, verify:

- [ ] App loads without infinite loop
- [ ] Sign in redirects to home correctly
- [ ] Sign out redirects to sign in correctly
- [ ] No "Maximum update depth exceeded" errors
- [ ] Location permissions requested only for client/guard/company roles
- [ ] Admin users don't get location permission requests
- [ ] Navigation between tabs works smoothly
- [ ] No console errors about navigation loops

## Files Modified

1. `app/_layout.tsx` - Simplified navigation logic, removed role setting
2. `app/(tabs)/_layout.tsx` - Added role initialization
3. `contexts/LocationTrackingContext.tsx` - Improved role management, updated location requirements

## What to Do Next

1. **Test the app** - Open the web preview and verify it loads without errors
2. **Check console logs** - Look for any remaining errors or warnings
3. **Test authentication flow**:
   - Sign in as different roles (client, guard, company, admin)
   - Verify navigation works correctly
   - Check location permissions are requested appropriately
4. **Test on mobile** - Scan QR code and test on actual device

## If Issues Persist

If you still see errors:

1. **Clear cache**: Stop the server (Ctrl+C) and restart with `bun expo start --web --clear`
2. **Check browser console**: Open DevTools and look for specific error messages
3. **Verify Firebase config**: Ensure Firebase is properly configured in `config/firebase.ts`
4. **Check user data**: Ensure user documents in Firestore have the correct `role` field

## Prevention

To prevent similar issues in the future:

1. **Avoid calling state setters in navigation effects** - Keep navigation logic separate from state management
2. **Use refs for navigation tracking** - Prevents unnecessary re-renders
3. **Be careful with dependency arrays** - Don't include functions that trigger navigation in navigation effects
4. **Initialize context state in the right place** - Set role in tabs layout, not root layout
5. **Add early returns in setters** - Prevent unnecessary state updates when value hasn't changed
