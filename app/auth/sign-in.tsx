import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Shield, Fingerprint } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { biometricService } from '@/services/biometricService';
import Colors from '@/constants/colors';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, user, isLoading: authLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('client@demo.com'); // Pre-fill demo credentials
  const [password, setPassword] = useState('demo123'); // Pre-fill demo credentials
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  // Handle navigation when user logs in successfully
  useEffect(() => {
    if (!authLoading && user) {
      console.log('[SignIn] User logged in, navigating based on role:', user.role);
      switch (user.role) {
        case 'client':
        case 'guard':
          router.replace('/(tabs)/home');
          break;
        case 'company':
          router.replace('/(tabs)/company-home');
          break;
        case 'admin':
          router.replace('/(tabs)/admin-home');
          break;
        default:
          router.replace('/(tabs)/home');
      }
    }
  }, [user, authLoading, router]);

  const checkBiometric = async () => {
    const available = await biometricService.isAvailable();
    const enabled = await biometricService.isBiometricEnabled();
    setBiometricAvailable(available);
    setBiometricEnabled(enabled);
    console.log('[SignIn] Biometric available:', available, 'enabled:', enabled);
  };

  const handleSignIn = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(trimmedEmail, trimmedPassword);

      if (result.success) {
        console.log('[SignIn] Login successful, navigating...');
        // Don't set loading to false here, let the auth state change handle navigation
        // The index.tsx will handle the navigation based on user role
      } else {
        setError(result.error || 'Failed to sign in');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('[SignIn] Unexpected error:', error);
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleBiometricSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const authenticated = await biometricService.authenticate('Sign in with biometrics');
      
      if (!authenticated) {
        setError('Biometric authentication failed');
        setIsLoading(false);
        return;
      }

      const credentials = await biometricService.getStoredCredentials();
      
      if (!credentials) {
        setError('No stored credentials found');
        setIsLoading(false);
        return;
      }

      const result = await signIn(credentials.email, credentials.encryptedPassword);

      if (!result.success) {
        setError(result.error || 'Failed to sign in');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('[SignIn] Biometric sign in error:', error);
      setError('Biometric sign in failed');
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={48} color={Colors.gold} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Escolta Pro</Text>
          <Text style={styles.subtitle}>Executive Protection On-Demand</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(text) => setEmail(text.trim())}
              placeholder="your@email.com"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {biometricAvailable && biometricEnabled && (
            <TouchableOpacity
              style={[styles.biometricButton, isLoading && styles.buttonDisabled]}
              onPress={handleBiometricSignIn}
              disabled={isLoading}
            >
              <Fingerprint size={24} color={Colors.gold} />
              <Text style={styles.biometricButtonText}>Sign in with Biometrics</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/sign-up' as any)}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Demo Accounts:
          </Text>
          <Text style={styles.footerText}>
            Client: client@demo.com | Guard: guard1@demo.com
          </Text>
          <Text style={styles.footerText}>
            Company: company@demo.com | Admin: admin@demo.com
          </Text>
          <Text style={styles.footerText}>
            Password: demo123 (for all accounts)
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  error: {
    color: Colors.error,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  button: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginHorizontal: 16,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textTertiary,
    fontSize: 12,
    textAlign: 'center' as const,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 8,
  },
  biometricButtonText: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
