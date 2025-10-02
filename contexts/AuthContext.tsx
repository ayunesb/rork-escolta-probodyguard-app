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
import { auth, db } from '@/lib/firebase';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserFromFirestore(firebaseUser);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserFromFirestore = async (firebaseUser: FirebaseUser) => {
    try {
      console.log('[Auth] Loading user from Firestore:', firebaseUser.uid);
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
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
        };
        console.log('[Auth] User loaded successfully:', user.email);
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
    }
  };

  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[Auth] Signing in:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('[Auth] Firebase sign in successful, loading user data...');
      
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user: User = {
          id: userData.id || userCredential.user.uid,
          email: userData.email,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          language: userData.language,
          kycStatus: userData.kycStatus,
          createdAt: userData.createdAt || new Date().toISOString(),
        };
        console.log('[Auth] User data loaded:', user.email);
        setUser(user);
        setIsLoading(false);
        return { success: true };
      } else {
        console.error('[Auth] User document not found in Firestore');
        await firebaseSignOut(auth);
        return { success: false, error: 'User data not found' };
      }
    } catch (error: any) {
      console.error('[Auth] Sign in error:', error);
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
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

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
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
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      await setDoc(doc(db, 'users', user.id), updatedUser, { merge: true });
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
