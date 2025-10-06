import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { UserPlus, Mail, Shield, CheckCircle, XCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { mockGuards } from '@/mocks/guards';
import Colors from '@/constants/colors';

export default function CompanyGuardsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');

  const companyGuards = mockGuards.filter(g => g.companyId === user?.id);

  const handleSendInvite = () => {
    if (!inviteEmail || !inviteName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Alert.alert(
      'Invitation Sent',
      `An invitation has been sent to ${inviteEmail}. They will receive an email with instructions to join your company.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setInviteEmail('');
            setInviteName('');
            setShowInviteForm(false);
          },
        },
      ]
    );
  };

  const handleRemoveGuard = (guardId: string, guardName: string) => {
    Alert.alert(
      'Remove Guard',
      `Are you sure you want to remove ${guardName} from your company?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', `${guardName} has been removed from your company.`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View>
          <Text style={styles.title}>Manage Guards</Text>
          <Text style={styles.subtitle}>
            {companyGuards.length} guard{companyGuards.length !== 1 ? 's' : ''} in your team
          </Text>
        </View>
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => setShowInviteForm(!showInviteForm)}
        >
          <UserPlus size={20} color={Colors.background} />
          <Text style={styles.inviteButtonText}>Invite</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {showInviteForm && (
          <View style={styles.inviteForm}>
            <Text style={styles.formTitle}>Invite New Guard</Text>
            <Text style={styles.formSubtitle}>
              Send an invitation to a security professional to join your company
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={Colors.textTertiary}
                value={inviteName}
                onChangeText={setInviteName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="guard@example.com"
                placeholderTextColor={Colors.textTertiary}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowInviteForm(false);
                  setInviteEmail('');
                  setInviteName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendInvite}
              >
                <Mail size={18} color={Colors.background} />
                <Text style={styles.sendButtonText}>Send Invitation</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Guards</Text>
          {companyGuards.length === 0 ? (
            <View style={styles.emptyState}>
              <Shield size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No guards yet</Text>
              <Text style={styles.emptySubtext}>
                Invite security professionals to join your company
              </Text>
            </View>
          ) : (
            companyGuards.map((guard) => (
              <View key={guard.id} style={styles.guardCard}>
                <View style={styles.guardHeader}>
                  <View style={styles.guardInfo}>
                    <Text style={styles.guardName}>
                      {guard.firstName} {guard.lastName}
                    </Text>
                    <Text style={styles.guardEmail}>{guard.email}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: guard.availability ? Colors.success + '20' : Colors.textTertiary + '20' }]}>
                    <Text style={[styles.statusText, { color: guard.availability ? Colors.success : Colors.textTertiary }]}>
                      {guard.availability ? 'Available' : 'Offline'}
                    </Text>
                  </View>
                </View>

                <View style={styles.guardStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{guard.completedJobs}</Text>
                    <Text style={styles.statLabel}>Jobs</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{guard.rating.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>${guard.hourlyRate}</Text>
                    <Text style={styles.statLabel}>Per Hour</Text>
                  </View>
                </View>

                <View style={styles.guardActions}>
                  <View style={[styles.kycBadge, { backgroundColor: guard.kycStatus === 'approved' ? Colors.success + '20' : Colors.warning + '20' }]}>
                    {guard.kycStatus === 'approved' ? (
                      <CheckCircle size={14} color={Colors.success} />
                    ) : (
                      <XCircle size={14} color={Colors.warning} />
                    )}
                    <Text style={[styles.kycText, { color: guard.kycStatus === 'approved' ? Colors.success : Colors.warning }]}>
                      KYC {guard.kycStatus}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveGuard(guard.id, `${guard.firstName} ${guard.lastName}`)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  inviteForm: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    paddingVertical: 14,
    borderRadius: 12,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  guardCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  guardInfo: {
    flex: 1,
  },
  guardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  guardEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  guardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  guardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  kycText: {
    fontSize: 12,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
  },
  removeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.error + '20',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.error,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center' as const,
  },
});
