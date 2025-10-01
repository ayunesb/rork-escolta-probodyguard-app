import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { User, Mail, Phone, Globe, Shield, LogOut, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/sign-in' as any);
          },
        },
      ]
    );
  };

  const getKYCStatusColor = () => {
    switch (user?.kycStatus) {
      case 'approved': return Colors.success;
      case 'rejected': return Colors.error;
      default: return Colors.warning;
    }
  };

  const getKYCStatusIcon = () => {
    switch (user?.kycStatus) {
      case 'approved': return <CheckCircle size={20} color={Colors.success} />;
      case 'rejected': return <AlertCircle size={20} color={Colors.error} />;
      default: return <AlertCircle size={20} color={Colors.warning} />;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <User size={48} color={Colors.gold} />
          </View>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <View style={styles.roleBadge}>
            <Shield size={16} color={Colors.gold} />
            <Text style={styles.roleText}>{user?.role.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Mail size={20} color={Colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Phone size={20} color={Colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user?.phone}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Globe size={20} color={Colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Language</Text>
                <Text style={styles.infoValue}>{user?.language.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Status</Text>
          
          <View style={styles.kycCard}>
            <View style={styles.kycHeader}>
              {getKYCStatusIcon()}
              <Text style={[styles.kycStatus, { color: getKYCStatusColor() }]}>
                {user?.kycStatus.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.kycDescription}>
              {user?.kycStatus === 'approved' 
                ? 'Your account is fully verified' 
                : user?.kycStatus === 'rejected'
                ? 'Verification failed. Please contact support.'
                : 'Your documents are under review'}
            </Text>
            {user?.kycStatus === 'pending' && (
              <TouchableOpacity style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Upload Documents</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0 (Phase 1 MVP)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gold + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  kycCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  kycHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  kycStatus: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  kycDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.error,
    marginTop: 8,
  },
  signOutText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  version: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center' as const,
    marginTop: 24,
    marginBottom: 8,
  },
});
