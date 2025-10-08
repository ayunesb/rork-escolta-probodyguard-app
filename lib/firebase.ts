import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAjjsRChFfCQi3piUdtiUCqyysFrh2Cdes",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "escolta-pro-fe90e.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "escolta-pro-fe90e",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "escolta-pro-fe90e.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "919834684647",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:919834684647:web:60dad6457ad0f92b068642"
};

let app: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;
let realtimeDbInstance: Database;
let initialized = false;

export const initializeFirebaseServices = async (): Promise<void> => {
  if (initialized) {
    console.log('[Firebase] Already initialized');
    return;
  }

  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    console.log('[Firebase] App initialized');

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'),
          isTokenAutoRefreshEnabled: true
        });
        console.log('[Firebase] App Check initialized for web');
      } catch (error) {
        console.warn('[Firebase] App Check initialization failed (non-critical):', error);
      }
    }

    try {
      authInstance = getAuth(app);
    } catch {
      authInstance = initializeAuth(app, {
        persistence: {
          type: 'LOCAL',
        }
      });
    }
    console.log('[Firebase] Auth initialized');

    dbInstance = getFirestore(app);
    console.log('[Firebase] Firestore initialized');

    realtimeDbInstance = getDatabase(app);
    console.log('[Firebase] Realtime Database initialized');

    initialized = true;
  } catch (error) {
    console.error('[Firebase] Initialization error:', error);
    throw error;
  }
};

export const auth = (): Auth => {
  if (!authInstance) {
    throw new Error('[Firebase] Auth not initialized. Call initializeFirebaseServices() first.');
  }
  return authInstance;
};

export const db = (): Firestore => {
  if (!dbInstance) {
    throw new Error('[Firebase] Firestore not initialized. Call initializeFirebaseServices() first.');
  }
  return dbInstance;
};

export const realtimeDb = (): Database => {
  if (!realtimeDbInstance) {
    throw new Error('[Firebase] Realtime Database not initialized. Call initializeFirebaseServices() first.');
  }
  return realtimeDbInstance;
};

initializeFirebaseServices().catch(error => {
  console.error('[Firebase] Auto-initialization failed:', error);
});
