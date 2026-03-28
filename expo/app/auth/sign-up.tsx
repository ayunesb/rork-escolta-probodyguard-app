import { useState } from 'react';
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
import { Shield, CheckSquare, Square } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import Colors from '@/constants/colors';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedDataProcessing, setAcceptedDataProcessing] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);

  const handleSignUp = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedPhone = phone.trim();
    
    if (!trimmedEmail || !trimmedPassword || !trimmedFirstName || !trimmedLastName || !trimmedPhone) {
      setError('Please fill in all fields');
      return;
    }

    if (!acceptedTerms || !acceptedPrivacy || !acceptedDataProcessing) {
      setError('Please accept the required terms and conditions');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await signUp(trimmedEmail, trimmedPassword, trimmedFirstName, trimmedLastName, trimmedPhone, role);

    if (result.success && result.needsVerification) {
      setShowVerificationMessage(true);
      setIsLoading(false);
    } else if (result.success) {
      router.replace('/(tabs)/home');
    } else {
      setError(result.error || 'Failed to sign up');
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ headerShown: false }} />
      {showVerificationMessage ? (
        <View style={[styles.verificationContainer, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.iconContainer}>
            <Shield size={48} color={Colors.gold} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.verificationText}>
            We&apos;ve sent a verification link to {email}. Please check your email and click the link to verify your account.
          </Text>
          <Text style={styles.verificationSubtext}>
            After verifying, you can sign in to your account.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/auth/sign-in')}
          >
            <Text style={styles.buttonText}>Go to Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={48} color={Colors.gold} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Escolta Pro</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.roleSelector}>
            <Text style={styles.label}>I am a</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[styles.roleButton, role === 'client' && styles.roleButtonActive]}
                onPress={() => setRole('client')}
              >
                <Text style={[styles.roleButtonText, role === 'client' && styles.roleButtonTextActive]}>
                  Client
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, role === 'guard' && styles.roleButtonActive]}
                onPress={() => setRole('guard')}
              >
                <Text style={[styles.roleButtonText, role === 'guard' && styles.roleButtonTextActive]}>
                  Guard
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.roleButtons, { marginTop: 12 }]}>
              <TouchableOpacity
                style={[styles.roleButton, role === 'company' && styles.roleButtonActive]}
                onPress={() => setRole('company')}
              >
                <Text style={[styles.roleButtonText, role === 'company' && styles.roleButtonTextActive]}>
                  Company
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
                onPress={() => setRole('admin')}
              >
                <Text style={[styles.roleButtonText, role === 'admin' && styles.roleButtonTextActive]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="John"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Doe"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="words"
              />
            </View>
          </View>

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
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+1-555-0100"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
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

          <View style={styles.consentSection}>
            <Text style={styles.consentTitle}>Terms & Conditions</Text>
            
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              {acceptedTerms ? (
                <CheckSquare size={24} color={Colors.gold} />
              ) : (
                <Square size={24} color={Colors.textSecondary} />
              )}
              <Text style={styles.checkboxText}>
                I accept the <Text style={styles.link}>Terms of Service</Text> *
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
            >
              {acceptedPrivacy ? (
                <CheckSquare size={24} color={Colors.gold} />
              ) : (
                <Square size={24} color={Colors.textSecondary} />
              )}
              <Text style={styles.checkboxText}>
                I accept the <Text style={styles.link}>Privacy Policy</Text> *
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAcceptedDataProcessing(!acceptedDataProcessing)}
            >
              {acceptedDataProcessing ? (
                <CheckSquare size={24} color={Colors.gold} />
              ) : (
                <Square size={24} color={Colors.textSecondary} />
              )}
              <Text style={styles.checkboxText}>
                I consent to data processing for service delivery *
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAcceptedMarketing(!acceptedMarketing)}
            >
              {acceptedMarketing ? (
                <CheckSquare size={24} color={Colors.gold} />
              ) : (
                <Square size={24} color={Colors.textSecondary} />
              )}
              <Text style={styles.checkboxText}>
                I agree to receive marketing communications (optional)
              </Text>
            </TouchableOpacity>

            <Text style={styles.requiredNote}>* Required</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.back()}
          >
            <Text style={styles.linkText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      )}
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
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  roleSelector: {
    marginBottom: 24,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  roleButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  roleButtonTextActive: {
    color: Colors.background,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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
  verificationContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
    marginTop: 24,
    marginBottom: 16,
    lineHeight: 24,
  },
  verificationSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  consentSection: {
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  link: {
    color: Colors.gold,
    textDecorationLine: 'underline' as const,
  },
  requiredNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic' as const,
  },
});
