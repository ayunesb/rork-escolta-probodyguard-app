import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

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
} else {
  console.log('[Firebase] App Check skipped for native (requires native config)');
}

let auth: Auth;
try {
  auth = getAuth(app);
} catch {
  auth = initializeAuth(app, {
    persistence: {
      type: 'LOCAL',
    }
  });
}

const db = getFirestore(app);
const realtimeDb = getDatabase(app);

export { app, auth, db, realtimeDb };
