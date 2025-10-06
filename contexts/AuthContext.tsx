import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole } from '@/types';
import { auth, db } from '@/config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { notificationService } from '@/services/notificationService';
import { rateLimitService } from '@/services/rateLimitService';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[Auth] State changed:', firebaseUser?.uid);
      
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<User, 'id'>;
            setUser({ id: firebaseUser.uid, ...userData });
            
            notificationService.registerForPushNotifications(firebaseUser.uid).catch(err => {
              console.error('[Auth] Notification registration failed:', err);
            });
          } else {
            console.error('[Auth] User document not found');
            setUser(null);
          }
        } catch (error) {
          console.error('[Auth] Error loading user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[Auth] Signing in:', email);
      
      const rateLimitCheck = await rateLimitService.checkRateLimit('login', email);
      if (!rateLimitCheck.allowed) {
        const errorMessage = rateLimitService.getRateLimitError('login', rateLimitCheck.blockedUntil!);
        console.log('[Auth] Rate limit exceeded for:', email);
        return { success: false, error: errorMessage };
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('[Auth] Sign in successful:', userCredential.user.uid);
      
      await rateLimitService.resetRateLimit('login', email);
      
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Sign in error:', error);
      let errorMessage = 'Failed to sign in';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later';
      }
      
      return { success: false, error: errorMessage };
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
      const userId = userCredential.user.uid;
      
      const userData: Omit<User, 'id'> = {
        email,
        role,
        firstName,
        lastName,
        phone,
        language: 'en',
        kycStatus: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'users', userId), userData);
      console.log('[Auth] User document created:', userId);
      
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Sign up error:', error);
      let errorMessage = 'Failed to sign up';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      console.log('[Auth] Signing out');
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      console.log('[Auth] Updating user:', user.id);
      const { id, ...updateData } = updates;
      await updateDoc(doc(db, 'users', user.id), updateData);
      setUser({ ...user, ...updates });
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
