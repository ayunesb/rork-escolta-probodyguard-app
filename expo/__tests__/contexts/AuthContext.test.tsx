/**
 * Auth Flow Unit Tests
 * Tests for sign-in, sign-up, email verification, and session management
 */

// Mock logger before any imports that might use Firebase
jest.mock('../../utils/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock Firebase modules before importing AuthContext
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase', () => ({
  auth: jest.fn(() => ({ currentUser: null })),
  db: jest.fn(() => ({})),
}));
jest.mock('@/services/rateLimitService');
jest.mock('@/services/monitoringService');
jest.mock('@/services/notificationService', () => ({
  registerForPushNotificationsAsync: jest.fn().mockResolvedValue('mock-expo-token'),
}));
jest.mock('@/services/pushNotificationService', () => ({
  pushNotificationService: {
    registerDevice: jest.fn().mockResolvedValue(undefined),
  },
}));

import { renderHook, act } from '@testing-library/react-native';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import * as firebaseAuth from 'firebase/auth';
import * as firestore from 'firebase/firestore';
import { rateLimitService } from '@/services/rateLimitService';
import { monitoringService } from '@/services/monitoringService';
import * as firebaseLib from '@/lib/firebase';
import React from 'react';

describe('AuthContext - Sign In Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock rate limiting - allow by default
    (rateLimitService.checkRateLimit as jest.Mock).mockResolvedValue({
      allowed: true,
      attemptsRemaining: 5,
    });
    
    (rateLimitService.resetRateLimit as jest.Mock).mockResolvedValue(undefined);
    (monitoringService.trackEvent as jest.Mock).mockResolvedValue(undefined);
    (monitoringService.reportError as jest.Mock).mockResolvedValue(undefined);
  });

  it('should successfully sign in with valid credentials', async () => {
    const mockUser = {
      uid: 'test-user-123',
      email: 'test@example.com',
      emailVerified: true,
    };

    const mockUserData = {
      email: 'test@example.com',
      role: 'client',
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
      language: 'en',
      kycStatus: 'approved',
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true,
      emailVerified: true,
      updatedAt: '2024-01-01T00:00:00Z',
    };

    (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockUser,
    });

    (firestore.getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => mockUserData,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'password123');
    });

    expect(signInResult).toEqual({ success: true });
    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password123'
    );
    expect(rateLimitService.resetRateLimit).toHaveBeenCalledWith('login', 'test@example.com');
    expect(monitoringService.trackEvent).toHaveBeenCalledWith(
      'user_login',
      expect.objectContaining({ email: 'test@example.com' }),
      mockUser.uid
    );
  });

  it('should reject sign-in with unverified email when ALLOW_UNVERIFIED_LOGIN is disabled', async () => {
    const originalEnv = process.env.EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN;
    process.env.EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN = '0';

    const mockUser = {
      uid: 'test-user-123',
      email: 'test@example.com',
      emailVerified: false,
    };

    (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockUser,
    });

    (firebaseAuth.signOut as jest.Mock).mockResolvedValue(undefined);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'password123');
    });

    expect(signInResult).toEqual({
      success: false,
      error: 'Please verify your email before signing in',
      emailNotVerified: true,
    });
    expect(firebaseAuth.signOut).toHaveBeenCalled();

    process.env.EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN = originalEnv;
  });

  it('should handle rate limiting during sign-in', async () => {
    const blockedUntil = new Date(Date.now() + 60000);
    
    (rateLimitService.checkRateLimit as jest.Mock).mockResolvedValue({
      allowed: false,
      attemptsRemaining: 0,
      blockedUntil,
    });

    (rateLimitService.getRateLimitError as jest.Mock).mockReturnValue(
      'Too many login attempts. Please try again in 1 minute.'
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'password123');
    });

    expect(signInResult).toEqual({
      success: false,
      error: 'Too many login attempts. Please try again in 1 minute.',
    });
    expect(firebaseAuth.signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('should handle invalid credentials error', async () => {
    (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
      code: 'auth/invalid-credential',
      message: 'Invalid credentials',
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'wrongpassword');
    });

    expect(signInResult).toEqual({
      success: false,
      error: 'Invalid email or password',
    });
    expect(monitoringService.reportError).toHaveBeenCalled();
  });
});

describe('AuthContext - Sign Up Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (monitoringService.trackEvent as jest.Mock).mockResolvedValue(undefined);
    (monitoringService.reportError as jest.Mock).mockResolvedValue(undefined);
  });

  it('should successfully sign up with valid data', async () => {
    const mockUser = {
      uid: 'new-user-123',
      email: 'newuser@example.com',
    };

    (firebaseAuth.createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockUser,
    });

    (firebaseAuth.sendEmailVerification as jest.Mock).mockResolvedValue(undefined);
    (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);
    (firebaseAuth.signOut as jest.Mock).mockResolvedValue(undefined);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp(
        'newuser@example.com',
        'StrongPassword123!',
        'John',
        'Doe',
        '+1234567890',
        'client'
      );
    });

    expect(signUpResult).toEqual({
      success: true,
      needsVerification: true,
    });

    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'newuser@example.com',
      'StrongPassword123!'
    );
    expect(firebaseAuth.sendEmailVerification).toHaveBeenCalled();
    expect(firestore.setDoc).toHaveBeenCalled();
    expect(firebaseAuth.signOut).toHaveBeenCalled();
    expect(monitoringService.trackEvent).toHaveBeenCalledWith(
      'user_signup',
      expect.objectContaining({
        email: 'newuser@example.com',
        role: 'client',
      }),
      mockUser.uid
    );
  });

  it('should reject weak passwords', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let signUpResult: { success: boolean; error?: string; needsVerification?: boolean } | undefined;
    await act(async () => {
      signUpResult = await result.current.signUp(
        'newuser@example.com',
        'weak',
        'John',
        'Doe',
        '+1234567890',
        'client'
      );
    });

    expect(signUpResult?.success).toBe(false);
    expect(signUpResult?.error).toContain('Password is not strong enough');
    expect(firebaseAuth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('should handle email already in use error', async () => {
    (firebaseAuth.createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
      code: 'auth/email-already-in-use',
      message: 'Email already in use',
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp(
        'existing@example.com',
        'StrongPassword123!',
        'John',
        'Doe',
        '+1234567890',
        'client'
      );
    });

    expect(signUpResult).toEqual({
      success: false,
      error: 'Email already in use',
    });
  });
});

describe('AuthContext - Email Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should resend verification email successfully', async () => {
    const mockUser = {
      uid: 'test-user-123',
      email: 'test@example.com',
      emailVerified: false,
    };

    const mockAuth = {
      currentUser: mockUser,
    };

    jest.spyOn(firebaseLib, 'auth').mockReturnValue(mockAuth as any);
    (firebaseAuth.reload as jest.Mock).mockResolvedValue(undefined);
    (firebaseAuth.sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let resendResult;
    await act(async () => {
      resendResult = await result.current.resendVerificationEmail();
    });

    expect(resendResult).toEqual({ success: true });
    expect(firebaseAuth.sendEmailVerification).toHaveBeenCalledWith(mockUser);
  });

  it('should handle already verified email', async () => {
    const mockUser = {
      uid: 'test-user-123',
      email: 'test@example.com',
      emailVerified: true,
    };

    const mockAuth = {
      currentUser: mockUser,
    };

    jest.spyOn(firebaseLib, 'auth').mockReturnValue(mockAuth as any);
    (firebaseAuth.reload as jest.Mock).mockResolvedValue(undefined);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let resendResult;
    await act(async () => {
      resendResult = await result.current.resendVerificationEmail();
    });

    expect(resendResult).toEqual({
      success: false,
      error: 'Email already verified',
    });
    expect(firebaseAuth.sendEmailVerification).not.toHaveBeenCalled();
  });

  it('should handle no user signed in', async () => {
    const mockAuth = {
      currentUser: null,
    };

    jest.spyOn(firebaseLib, 'auth').mockReturnValue(mockAuth as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let resendResult;
    await act(async () => {
      resendResult = await result.current.resendVerificationEmail();
    });

    expect(resendResult).toEqual({
      success: false,
      error: 'No user signed in',
    });
  });
});

describe('AuthContext - Session Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should sign out successfully', async () => {
    (firebaseAuth.signOut as jest.Mock).mockResolvedValue(undefined);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signOut();
    });

    expect(firebaseAuth.signOut).toHaveBeenCalled();
  });

  it('should update user data successfully', async () => {
    const mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'client' as const,
    };

    (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Set initial user
    await act(async () => {
      // Simulate user being set from auth state change
      (result.current as any).user = mockUser;
    });

    await act(async () => {
      await result.current.updateUser({ firstName: 'Updated' });
    });

    expect(firestore.updateDoc).toHaveBeenCalled();
  });
});
