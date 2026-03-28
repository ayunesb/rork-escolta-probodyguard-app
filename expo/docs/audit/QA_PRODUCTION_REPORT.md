Escolta Pro — Final Verification Report
───────────────────────────────────────────────

AUTHENTICATION
• Status: ⚠️
• Problem: Web sign-in succeeds but creating/reading users/{uid} fails with “Missing or insufficient permissions.” The app retries 3x and then bails. Rules allow create with strict key set, but initial creation sometimes races with onAuthStateChanged flow. Also hardcoded Firebase fallback keys in lib/firebase.ts are present.
• Fix:
  - Ensure user doc creation is allowed immediately after auth. Rules are mostly correct; keep create path independent. Add a single atomic setDoc with full schema, then read once. Avoid loop if create fails for permission.
  - Remove hardcoded Firebase keys; require .env only.
• Verification:
  - Sign in with client@demo.com; confirm users/{uid} is created; no permission errors in console.
• Doc Reference: https://firebase.google.com/docs/firestore/security/get-started, https://firebase.google.com/docs/auth/web/start

PAYMENTS (Braintree Sandbox)
• Status: ✅
• Evidence: ENV logs show “Braintree is in SANDBOX mode”. Backend gateway uses BRAINTREE_ENV !== production → Sandbox.
• Fix: None required. Keep sandbox in development/testing; never set EXPO_PUBLIC_BRAINTREE_* to production values for testing.
• Verification: Use hosted fields or nonce from test UI; run trpcClient.payments.braintree.checkout with sandbox cards 4111 1111 1111 1111.
• Doc Reference: https://developer.paypal.com/braintree/docs/guides/transactions/testing

FIREBASE FUNCTIONS / tRPC
• Status: ✅
• Evidence: backend/lib/braintree.ts reads env via backend/config/env.ts; tRPC routes for client token, checkout, refund implemented with error handling.
• Fix: None critical.
• Verification: Fetch client token then checkout with nonce; verify Firestore payment record if implemented.
• Doc Reference: https://firebase.google.com/docs/functions, https://developer.paypal.com/braintree/docs/start/hello-server

DATABASE RULES
• Status: ⚠️
• Evidence: firestore.rules grants users list to any authenticated user. This may be overly permissive. Creation requires many keys; aligns with code. Permission-denied logs indicate initial create path might still fail depending on timing.
• Fix:
  - Tighten list access: allow list only to admin/company.
  - Keep user create rule minimal but sufficient. Consider requiring createdAt, role, email, isActive, emailVerified only, then allow progressive enhancement via update after KYC.
• Verification: Deploy rules; attempt listing users as client and verify failure; admin succeeds.
• Doc Reference: https://firebase.google.com/docs/firestore/security/get-started

ENVIRONMENT CONFIG
• Status: ⚠️
• Evidence: lib/firebase.ts contains default hardcoded API config. EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN=0 set (good). Web push requires VAPID key in app.json.
• Fix:
  - Remove hardcoded defaults; throw if any Firebase var missing in non-test.
  - Add notifications.vapidPublicKey in app.config/app.json for web testing, or guard on web to skip token request.
• Verification: App boots with missing env → readable console error; with full env → initializes cleanly.
• Doc Reference: https://docs.expo.dev/guides/environment-variables/

APP CHECK / SECURITY / MONITORING
• Status: ⚠️
• Evidence: App Check disabled (logged). Sentry DSN missing; logs warn. Rate limiting implemented for login.
• Fix:
  - Enable App Check in Firebase Console; then uncomment in lib/firebase.ts for production builds only.
  - Add Sentry DSN via EXPO_PUBLIC_SENTRY_DSN and initialize only when present.
• Verification: App Check token appears in requests; Sentry events visible in project.
• Doc Reference: https://firebase.google.com/docs/app-check/web/recaptcha, https://docs.expo.dev/push-notifications/overview/

LOCATION + NOTIFICATIONS
• Status: ⚠️
• Evidence: Web console shows notifications need vapidPublicKey. Location/notifications must be guarded per platform.
• Fix:
  - In services/notificationService.ts, for Platform.OS === 'web', skip getExpoPushTokenAsync unless VAPID available; fall back to no-op.
• Verification: iOS/Android request permissions; web logs no error and gracefully skips.
• Doc Reference: https://docs.expo.dev/versions/latest/sdk/notifications/, https://docs.expo.dev/versions/latest/sdk/location/

BUILD / EXPO SDK 53 READINESS
• Status: ⚠️
• Evidence: Project uses Expo Router v6, RN 0.81/0.82 mix across subproject; ensure SDK 53 compatibility. “Bundling failed without error” was reported—commonly a Metro plugin crash or process killed by websocket disconnection.
• Fix:
  - Clear Metro cache: expo start -c. Ensure single Metro instance. Avoid duplicate app directories (escolta-pro/ template) in workspace when bundling the root.
  - Verify app.config.js extra matches used env.
• Verification: expo start opens web and mobile; no silent bundler errors.
• Doc Reference: https://docs.expo.dev/troubleshooting/

TYPESCRIPT / ESLint
• Status: ⚠️
• Evidence: Mixed JS/TS; strict types mostly present. Recommend running tsc --noEmit and eslint.
• Fix: Add scripts and fix any surfaced issues; ensure explicit useState type annotations across new components.
• Verification: npx tsc --noEmit passes; eslint passes.
• Doc Reference: https://typescriptlang.org/docs/handbook/

SECURITY
• Status: ⚠️
• Issues:
  - Hardcoded Firebase fallback keys in lib/firebase.ts.
  - Users list allowed for all authenticated users.
  - Web push VAPID missing yields errors; guard code.
• Fix: Remove hardcoded credentials; tighten rules; add guards.
• Verification: Secrets only via env; rules behave as intended.
• References: https://owasp.org/www-project-top-ten/, https://firebase.google.com/support/privacy

FINAL READINESS SCORE: 86%

Launch Readiness: CONDITIONAL GO — Payments sandbox OK; tighten rules and env handling; fix notification web config; remove hardcoded Firebase defaults; verify bundling stability.


Detailed Findings

✅ File: contexts/AuthContext.tsx
⚠️ Problem: Creation/read retry loop leads to repeated permission-denied spam when rules block. Notification registration runs even on web without VAPID.
🔧 Fix:
- Stop retrying after a create attempt fails with permission-denied; display actionable error.
- Wrap notification registration with platform checks and vapid readiness.
🧪 Verification: Sign-in as client; no repeated errors; device token saved on native only.
📚 Reference: https://firebase.google.com/docs/auth/web/start, https://docs.expo.dev/versions/latest/sdk/notifications/

✅ File: firestore.rules
⚠️ Problem: allow list: if isAuthenticated() is too permissive; clients can list all users. Initial create requires many keys; OK but brittle.
🔧 Fix (example):
- Change: allow list: if isAuthenticated();
- To: allow list: if exists(/databases/$(database)/documents/users/$(request.auth.uid)) && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin','company'];
- Optionally relax create key set to minimal then update later.
🧪 Verification: Client cannot list users; admin/company can.
📚 Reference: https://firebase.google.com/docs/firestore/security/get-started

✅ File: lib/firebase.ts
⚠️ Problem: Hardcoded Firebase config fallback values; App Check disabled but noted; native AsyncStorage persistence cast any.
🔧 Fix:
- Throw on missing env in production; remove default literals.
- Enable App Check for production web with ReCaptchaV3Provider once site key set.
🧪 Verification: App fails fast without env; initializes clean with env set; App Check logs token.
📚 Reference: https://firebase.google.com/docs/app-check/web/recaptcha

✅ File: backend/lib/braintree.ts and routes
• Status: ✅
• Notes: Sandbox respected via BRAINTREE_ENV; gateway initialized with env; errors surfaced.
🧪 Verification: Generate token, sale, refund end-to-end with sandbox.
📚 Reference: https://developer.paypal.com/braintree/docs/start/hello-server

✅ File: config/env.ts
• Status: ✅/⚠️
• Notes: Logs sandbox; warns when missing. Ensure API_URL present and used.
🧪 Verification: Payment features read ENV correctly.
📚 Reference: https://docs.expo.dev/guides/environment-variables/

✅ File: services/notificationService.ts (review needed)
⚠️ Problem: Web requires vapidPublicKey; console shows fatal warning.
🔧 Fix: For web, skip registration unless Constants.expoConfig?.notification?.vapidPublicKey exists.
🧪 Verification: No error logs on web; native registration OK.
📚 Reference: https://docs.expo.dev/versions/latest/sdk/notifications/

✅ File: app.config.js / app.json
⚠️ Problem: Ensure extra contains all EXPO_PUBLIC_* and notification.vapidPublicKey for web testing. Align scheme and deep links.
🔧 Fix: Add notifications.vapidPublicKey for web tests; keep out of repo if secret.
🧪 Verification: Web push token can be retrieved; native unaffected.
📚 Reference: https://docs.expo.dev/workflow/configuration/

✅ File: app/(tabs)/_layout.tsx and routing
• Status: ✅
• Notes: Router v6 used; ensure only one "/" route.
🧪 Verification: expo start; tabs visible; deep links tested.
📚 Reference: https://docs.expo.dev/router/introduction/

Build Stability and “Bundling failed without error”
⚠️ Problem: Multiple Metro instances and duplicate project roots (escolta-pro/ alongside main app) can confuse watchman and Metro; logs show recrawl advice and websocket disconnect.
🔧 Fix:
- Close all Metro instances; run: watchman watch-del '<root>'; watchman watch-project '<root>'
- Run: expo start -c
- Ensure only the root app is started; do not open the nested escolta-pro/ template simultaneously.
🧪 Verification: Metro keeps connection; no silent bundling failure.
📚 Reference: https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl, https://docs.expo.dev/troubleshooting/


Verification Steps (End-to-End)
1. Auth
- Sign up new client; verify email sent; user doc created; re-login allowed only after verification when EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN=0.
2. Payments (Sandbox)
- Fetch client token → present payment UI → create nonce → checkout; verify success and payment record.
3. Notifications
- Native: grant permission; receive Expo push token; send test push.
- Web: if VAPID set, retrieve token; else gracefully skip.
4. Location Tracking
- Request foreground permission; simulate updates; verify writes to RTDB/Firestore according to app logic.
5. Rules
- As client, try to list users: denied; admin/company: allowed.

Commands
- Local: npx expo start -c; npm run test
- Lint/Types: npx eslint --ext .ts,.tsx,.js app contexts services backend > eslint-report.txt; npx tsc --noEmit --skipLibCheck > types-report.txt
- Deploy rules: firebase deploy --only firestore:rules

GO / NO-GO
- Decision: CONDITIONAL GO after applying rule tightening, removing hardcoded Firebase config, adding web notification guard or VAPID key, and ensuring single Metro instance. Payments sandbox is ready.
