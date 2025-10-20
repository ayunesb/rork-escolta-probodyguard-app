import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getDatabase, Database, connectDatabaseEmulator } from 'firebase/database';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { Platform } from 'react-native';
// AsyncStorage import left intentionally in comments for potential future persistence
// import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';



const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyAjjsRChFfCQi3piUdtiUCqyysFrh2Cdes',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'escolta-pro-fe90e.firebaseapp.com',
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    'escolta-pro-fe90e',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'escolta-pro-fe90e.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    '919834684647',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID ||
    '1:919834684647:web:60dad6457ad0f92b068642',
};

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let realtimeDbInstance: Database | undefined;
let initialized = false;

export const initializeFirebaseServices = async (): Promise<void> => {
  if (initialized) {
    console.log('[Firebase] Already initialized');
    return;
  }

  try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    console.log('[Firebase] App initialized');

    // Enable App Check for web (only in production)
  if (!__DEV__ && Platform.OS === 'web' && typeof globalThis !== 'undefined' && typeof (globalThis as any).window !== 'undefined') {
      try {
        initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(
            process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY || 
            '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
          ),
          isTokenAutoRefreshEnabled: true
        });
        console.log('[Firebase] App Check initialized for web');
      } catch {
        console.warn('[Firebase] App Check initialization failed (non-critical)');
      }
    } else if (__DEV__) {
      console.log('[AppCheck] Skipped in web development mode');
    }

    // ✅ Proper Auth Initialization (works in Expo Go)
    try {
      // initializeAuth may throw on web; fallback to getAuth
        // Note: getReactNativePersistence may not be exported in this SDK version
        try {
          // Try initializeAuth without specifying persistence
          authInstance = initializeAuth(app as FirebaseApp);
        } catch {
          // Fallback to getAuth
          authInstance = getAuth(app as FirebaseApp);
        }
      console.log('[Firebase] Auth initialized with AsyncStorage persistence');
    } catch (error) {
      console.warn('[Firebase] initializeAuth failed, falling back to getAuth:', error);
      try {
        authInstance = getAuth(app as FirebaseApp);
      } catch {
        console.error('[Firebase] getAuth fallback failed');
      }
    }

    try {
      dbInstance = getFirestore(app as FirebaseApp);
      console.log('[Firebase] Firestore initialized');
    } catch (_e) {
      console.error('[Firebase] Firestore init error:', _e);
    }

    try {
      realtimeDbInstance = getDatabase(app as FirebaseApp);
      console.log('[Firebase] Realtime Database initialized');
    } catch (_e) {
      console.error('[Firebase] Realtime DB init error:', _e);
    }

    // Connect to emulators in development (only if EXPO_PUBLIC_USE_EMULATORS=1)
    if (__DEV__ && process.env.EXPO_PUBLIC_USE_EMULATORS === '1' && authInstance && dbInstance && realtimeDbInstance) {
      try {
        connectAuthEmulator(authInstance, 'http://127.0.0.1:9099');
        console.log('[Firebase] Connected to Auth emulator');
      } catch {
        console.log('[Firebase] Auth emulator already connected or unavailable');
      }

      try {
        connectFirestoreEmulator(dbInstance, '127.0.0.1', 8080);
        console.log('[Firebase] Connected to Firestore emulator');
      } catch {
        console.log('[Firebase] Firestore emulator already connected or unavailable');
      }

      try {
        connectDatabaseEmulator(realtimeDbInstance, '127.0.0.1', 9000);
        console.log('[Firebase] Connected to Realtime Database emulator');
      } catch {
        console.log('[Firebase] Database emulator already connected or unavailable');
      }
    } else if (__DEV__) {
      console.log('[Firebase] Using production Firebase (emulators disabled)');
    }

    initialized = true;
  } catch {
    console.error('[Firebase] Initialization error');
    throw new Error('Firebase initialization failed');
  }
};

// Export singletons
export const auth = (): Auth => {
  if (authInstance) return authInstance;
  try {
    const fallback = getAuth(getApp());
    console.warn('[Firebase] auth was not initialized via initializeFirebaseServices(); returning getAuth() fallback');
    return fallback;
  } catch {
    throw new Error('[Firebase] Auth not initialized and fallback failed. Call initializeFirebaseServices() first.');
  }
};

export const db = (): Firestore => {
  if (dbInstance) return dbInstance;
  try {
    const fallback = getFirestore(getApp());
    console.warn('[Firebase] Firestore was not initialized via initializeFirebaseServices(); returning getFirestore() fallback');
    return fallback;
  } catch {
    throw new Error('[Firebase] Firestore not initialized and fallback failed. Call initializeFirebaseServices() first.');
  }
};

export const realtimeDb = (): Database => {
  if (realtimeDbInstance) return realtimeDbInstance;
  try {
    const fallback = getDatabase(getApp());
    console.warn('[Firebase] Realtime DB was not initialized via initializeFirebaseServices(); returning getDatabase() fallback');
    return fallback;
  } catch {
    throw new Error('[Firebase] Realtime Database not initialized and fallback failed. Call initializeFirebaseServices() first.');
  }
};
