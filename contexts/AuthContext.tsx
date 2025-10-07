import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole } from '@/types';
import { auth, db } from '@/config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  reload,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { notificationService } from '@/services/notificationService';
import { rateLimitService } from '@/services/rateLimitService';
import { monitoringService } from '@/services/monitoringService';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const ensureUserDocument = useCallback(async (firebaseUser: { uid: string; email: string | null }) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const minimal: Omit<User, 'id'> = {
          email: firebaseUser.email ?? '',
          role: 'client',
          firstName: '',
          lastName: '',
          phone: '',
          language: 'en',
          kycStatus: 'pending',
          createdAt: new Date().toISOString(),
        } as Omit<User, 'id'>;
        try {
          await setDoc(userRef, minimal);
          console.log('[Auth] Created minimal user document');
        } catch (setDocError: any) {
          console.error('[Auth] Failed to create user document:', setDocError?.message ?? setDocError);
          if (setDocError?.code === 'permission-denied') {
            console.error('[Auth] Permission denied - check Firestore rules');
          }
          throw setDocError;
        }
        return minimal;
      }
      return snap.data() as Omit<User, 'id'>;
    } catch (e: any) {
      console.warn('[Auth] ensureUserDocument failed:', e?.message ?? e);
      throw e;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[Auth] State changed:', firebaseUser?.uid);
      if (firebaseUser) {
        try {
          let userData: Omit<User, 'id'> | null = null;
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries && !userData) {
            try {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (userDoc.exists()) {
                userData = userDoc.data() as Omit<User, 'id'>;
                console.log('[Auth] User document loaded successfully');
              } else {
                console.warn('[Auth] User document not found. Creating...');
                userData = await ensureUserDocument({ uid: firebaseUser.uid, email: firebaseUser.email });
              }
            } catch (err: any) {
              if (err?.code === 'permission-denied') {
                console.warn('[Auth] Permission denied on getDoc. Attempting self-create...');
                try {
                  userData = await ensureUserDocument({ uid: firebaseUser.uid, email: firebaseUser.email });
                } catch (createErr: any) {
                  console.error('[Auth] Failed to create user document:', createErr?.message);
                  retryCount++;
                  if (retryCount < maxRetries) {
                    console.log(`[Auth] Retrying... (${retryCount}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                  } else {
                    throw createErr;
                  }
                }
              } else {
                throw err;
              }
            }
          }

          if (userData) {
            setUser({ id: firebaseUser.uid, ...userData });
            setTimeout(() => {
              notificationService.registerForPushNotifications(firebaseUser.uid).catch(err => {
                console.error('[Auth] Notification registration failed:', err);
              });
            }, 100);
          } else {
            console.error('[Auth] Failed to load or create user data after retries');
            setUser(null);
          }
        } catch (error: any) {
          console.error('[Auth] Error loading user data:', error?.message ?? error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [ensureUserDocument]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; emailNotVerified?: boolean }> => {
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
      const allowUnverified = (process.env.EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN ?? '') === '1';
      if (!userCredential.user.emailVerified && !allowUnverified) {
        console.log('[Auth] Email not verified');
        await firebaseSignOut(auth);
        return { success: false, error: 'Please verify your email before signing in', emailNotVerified: true };
      }
      if (!userCredential.user.emailVerified && allowUnverified) {
        console.warn('[Auth] Email not verified — allowed due to EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN=1');
      }
      await rateLimitService.resetRateLimit('login', email);
      await monitoringService.trackEvent('user_login', { email, userId: userCredential.user.uid }, userCredential.user.uid);
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Sign in error:', error);
      await monitoringService.reportError({ error, context: { action: 'signIn', email } });
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
  ): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> => {
    try {
      console.log('[Auth] Signing up:', email, role);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      await sendEmailVerification(userCredential.user);
      console.log('[Auth] Verification email sent to:', email);
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
      await monitoringService.trackEvent('user_signup', { email, role, userId }, userId);
      await firebaseSignOut(auth);
      return { success: true, needsVerification: true };
    } catch (error: any) {
      console.error('[Auth] Sign up error:', error);
      await monitoringService.reportError({ error, context: { action: 'signUp', email, role } });
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
      const { id, ...updateData } = updates as Partial<User> & { id?: string };
      await updateDoc(doc(db, 'users', user.id), updateData);
      setUser({ ...user, ...updates });
    } catch (error) {
      console.error('[Auth] Update user error:', error);
    }
  }, [user]);

  const resendVerificationEmail = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'No user signed in' };
      }
      await reload(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        return { success: false, error: 'Email already verified' };
      }
      await sendEmailVerification(auth.currentUser);
      console.log('[Auth] Verification email resent');
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Resend verification error:', error);
      return { success: false, error: 'Failed to resend verification email' };
    }
  }, []);

  return useMemo(() => ({
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUser,
    resendVerificationEmail,
  }), [user, isLoading, signIn, signUp, signOut, updateUser, resendVerificationEmail]);
});
