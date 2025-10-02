import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth, initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAjjsRChFfCQi3piUdtiUCqyysFrh2Cdes',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'escolta-pro-fe90e.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'escolta-pro-fe90e',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'escolta-pro-fe90e.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '919834684647',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:919834684647:web:60dad6457ad0f92b068642',
};

console.log('[Firebase] Initializing with config:', {
  apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'missing',
  projectId: firebaseConfig.projectId,
  platform: Platform.OS,
});

let app: ReturnType<typeof initializeApp>;
let auth: Auth;
let db: Firestore;
let storage: ReturnType<typeof getStorage>;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  if (Platform.OS === 'web') {
    try {
      auth = initializeAuth(app, {
        persistence: browserLocalPersistence,
      });
    } catch (e) {
      auth = getAuth(app);
    }
    
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
    } catch (e) {
      db = getFirestore(app);
    }
  } else {
    auth = getAuth(app);
    db = getFirestore(app);
  }
  
  if (__DEV__) {
    (auth as any)._logFramework = () => {};
  }
  
  storage = getStorage(app);
  
  console.log('[Firebase] Initialization complete');
} catch (error) {
  console.error('[Firebase] Initialization error:', error);
  throw error;
}

export { app, auth, db, storage };
