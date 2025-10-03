import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole } from '@/types';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, initializeFirebaseServices } from '@/lib/firebase';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;
    let initTimeout: NodeJS.Timeout;

    const initialize = async () => {
      try {
        console.log('[Auth] Initializing Firebase');
        
        const initPromise = initializeFirebaseServices();
        const timeoutPromise = new Promise<never>((_, reject) => {
          initTimeout = setTimeout(() => reject(new Error('Firebase initialization timeout')), 5000);
        });
        
        await Promise.race([initPromise, timeoutPromise]);
        clearTimeout(initTimeout);
        
        if (!mounted) return;

        const authInstance = auth();
        unsubscribe = onAuthStateChanged(
          authInstance,
          async (firebaseUser) => {
            if (!mounted) return;
            
            if (firebaseUser) {
              await loadUserFromFirestore(firebaseUser);
            } else {
              setUser(null);
              setIsLoading(false);
              setIsInitialized(true);
            }
          },
          (error) => {
            if (!mounted) return;
            console.error('[Auth] Auth state change error:', error);
            setIsLoading(false);
            setIsInitialized(true);
          }
        );
      } catch (error) {
        console.error('[Auth] Initialization error:', error);
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    const safeTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('[Auth] Force completing initialization after 8s');
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, 8000);

    initialize();

    return () => {
      mounted = false;
      clearTimeout(safeTimeout);
      if (initTimeout) clearTimeout(initTimeout);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const loadUserFromFirestore = async (firebaseUser: FirebaseUser) => {
    try {
      console.log('[Auth] Loading user from Firestore:', firebaseUser.uid);
      const startTime = Date.now();
      
      const dbInstance = db();
      const fetchPromise = getDoc(doc(dbInstance, 'users', firebaseUser.uid));
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Firestore timeout')), 3000)
      );
      
      const userDoc = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log('[Auth] Firestore fetch took:', Date.now() - startTime, 'ms');
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user: User = {
          id: userData.id || firebaseUser.uid,
          email: userData.email,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          language: userData.language,
          kycStatus: userData.kycStatus,
          createdAt: userData.createdAt || new Date().toISOString(),
          braintreeCustomerId: userData.braintreeCustomerId,
          savedPaymentMethods: userData.savedPaymentMethods || [],
        };
        console.log('[Auth] User loaded successfully in', Date.now() - startTime, 'ms');
        setUser(user);
      } else {
        console.log('[Auth] User document does not exist');
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] Failed to load user from Firestore:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[Auth] Signing in:', email);
      setIsLoading(true);
      const authInstance = auth();
      const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      console.log('[Auth] Firebase sign in successful');
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Sign in error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: error.code === 'auth/invalid-credential' 
          ? 'Invalid email or password' 
          : 'Failed to sign in' 
      };
    }
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[Auth] Signing up:', email, role);
      const authInstance = auth();
      const dbInstance = db();
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
      
      const newUser: User = {
        id: userCredential.user.uid,
        email,
        role,
        firstName,
        lastName,
        phone,
        language: 'en',
        kycStatus: 'pending',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(dbInstance, 'users', userCredential.user.uid), newUser);
      setUser(newUser);
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Sign up error:', error);
      return { 
        success: false, 
        error: error.code === 'auth/email-already-in-use' 
          ? 'Email already in use' 
          : 'Failed to sign up' 
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const authInstance = auth();
      await firebaseSignOut(authInstance);
      setUser(null);
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const dbInstance = db();
      const updatedUser = { ...user, ...updates };
      await setDoc(doc(dbInstance, 'users', user.id), updatedUser, { merge: true });
      setUser(updatedUser);
    } catch (error) {
      console.error('[Auth] Update user error:', error);
    }
  }, [user]);

  return useMemo(() => ({
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUser,
  }), [user, isLoading, signIn, signUp, signOut, updateUser]);
});
