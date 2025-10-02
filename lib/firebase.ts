import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAjjsRChFfCQi3piUdtiUCqyysFrh2Cdes',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'escolta-pro-fe90e.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'escolta-pro-fe90e',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'escolta-pro-fe90e.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '919834684647',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:919834684647:web:60dad6457ad0f92b068642',
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let isInitializing = false;
let initializationPromise: Promise<void> | null = null;

const initializeFirebaseServices = async (): Promise<void> => {
  if (app && auth && db && storage) {
    return;
  }

  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }

  isInitializing = true;
  initializationPromise = (async () => {
    try {
      console.log('[Firebase] Starting initialization');
      
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
    } finally {
      isInitializing = false;
    }
  })();

  return initializationPromise;
};

const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    throw new Error('Firebase not initialized. Call initializeFirebaseServices first.');
  }
  return app;
};

const getFirebaseAuth = (): Auth => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized. Call initializeFirebaseServices first.');
  }
  return auth;
};

const getFirebaseDb = (): Firestore => {
  if (!db) {
    throw new Error('Firebase Firestore not initialized. Call initializeFirebaseServices first.');
  }
  return db;
};

const getFirebaseStorage = (): FirebaseStorage => {
  if (!storage) {
    throw new Error('Firebase Storage not initialized. Call initializeFirebaseServices first.');
  }
  return storage;
};

export { 
  initializeFirebaseServices,
  getFirebaseApp as app,
  getFirebaseAuth as auth,
  getFirebaseDb as db,
  getFirebaseStorage as storage
};
