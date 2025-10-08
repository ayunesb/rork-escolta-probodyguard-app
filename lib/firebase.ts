import { app, auth as authInstance, db as dbInstance, realtimeDb as realtimeDbInstance } from '@/config/firebase';

export const initializeFirebaseServices = async () => {
  console.log('[Firebase] Services already initialized via config/firebase');
  return Promise.resolve();
};

export const auth = () => authInstance;
export const db = () => dbInstance;
export const realtimeDb = () => realtimeDbInstance;

export { app };
