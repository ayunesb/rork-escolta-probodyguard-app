import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const SESSION_KEY = '@escolta_session';
const SESSION_TIMEOUT = 30 * 60 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;

interface SessionData {
  userId: string;
  lastActivity: number;
  expiresAt: number;
}

export const [SessionProvider, useSession] = createContextHook(() => {
  const { user, signOut } = useAuth();
  const [isSessionValid, setIsSessionValid] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const sessionCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const activityTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveSession = useCallback(async () => {
    if (!user) return;

    const sessionData: SessionData = {
      userId: user.id,
      lastActivity: Date.now(),
      expiresAt: Date.now() + SESSION_TIMEOUT,
    };

    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      console.log('[Session] Session saved');
    } catch (error) {
      console.error('[Session] Error saving session:', error);
    }
  }, [user]);

  const clearSession = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      console.log('[Session] Session cleared');
    } catch (error) {
      console.error('[Session] Error clearing session:', error);
    }
  }, []);

  const loadSession = useCallback(async (): Promise<SessionData | null> => {
    try {
      const stored = await AsyncStorage.getItem(SESSION_KEY);
      if (!stored) return null;

      const sessionData: SessionData = JSON.parse(stored);
      
      if (Date.now() > sessionData.expiresAt) {
        console.log('[Session] Session expired');
        await clearSession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('[Session] Error loading session:', error);
      return null;
    }
  }, [clearSession]);

  const refreshSession = useCallback(async () => {
    if (!user) return;

    const session = await loadSession();
    
    if (!session) {
      setIsSessionValid(false);
      await signOut();
      return;
    }

    if (Date.now() - session.lastActivity > SESSION_TIMEOUT) {
      console.log('[Session] Session timeout - signing out');
      setIsSessionValid(false);
      await signOut();
      return;
    }

    await saveSession();
    setIsSessionValid(true);
  }, [user, loadSession, saveSession, signOut]);

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    
    if (activityTimeout.current) {
      clearTimeout(activityTimeout.current);
    }

    activityTimeout.current = setTimeout(() => {
      saveSession();
    }, 1000);
  }, [saveSession]);

  const extendSession = useCallback(async () => {
    await saveSession();
    console.log('[Session] Session extended');
  }, [saveSession]);

  useEffect(() => {
    if (user) {
      saveSession();
      
      sessionCheckInterval.current = setInterval(() => {
        refreshSession();
      }, REFRESH_INTERVAL);

      return () => {
        if (sessionCheckInterval.current) {
          clearInterval(sessionCheckInterval.current);
        }
        if (activityTimeout.current) {
          clearTimeout(activityTimeout.current);
        }
      };
    } else {
      clearSession();
    }
  }, [user, saveSession, refreshSession, clearSession]);

  useEffect(() => {
    if (user) {
      loadSession().then(session => {
        if (!session) {
          setIsSessionValid(false);
        }
      });
    }
  }, [user, loadSession]);

  return useMemo(() => ({
    isSessionValid,
    lastActivity,
    updateActivity,
    refreshSession,
    extendSession,
    clearSession,
  }), [
    isSessionValid,
    lastActivity,
    updateActivity,
    refreshSession,
    extendSession,
    clearSession,
  ]);
});
