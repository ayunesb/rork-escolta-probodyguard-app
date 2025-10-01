import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole } from '@/types';

const STORAGE_KEY = '@escolta_user';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Signing in:', email);
      
      const mockUser: User = {
        id: 'user-' + Date.now(),
        email,
        role: email.includes('guard') ? 'guard' : email.includes('company') ? 'company' : email.includes('admin') ? 'admin' : 'client',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0100',
        language: 'en',
        kycStatus: 'pending',
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Failed to sign in' };
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
      console.log('Signing up:', email, role);

      const mockUser: User = {
        id: 'user-' + Date.now(),
        email,
        role,
        firstName,
        lastName,
        phone,
        language: 'en',
        kycStatus: 'pending',
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Failed to sign up' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
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
