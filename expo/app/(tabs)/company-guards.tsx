import { useCallback, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { httpsCallable } from 'firebase/functions';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { UserPlus, Mail, Shield, CheckCircle, XCircle, Upload, FileText, Copy, FolderOpen } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { functions as getFunctions, auth as getAuth } from '@/lib/firebase';
import type { Guard } from '@/types';
import Colors from '@/constants/colors';

const CSV_TEMPLATE = 'firstName,lastName,email,phone,hourlyRate\nJuan,Perez,juan.perez@example.com,+525512345678,180';

interface NewGuardInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hourlyRate: number;
}

interface CreateGuardResult {
  email: string;
  success: boolean;
  uid?: string;
  error?: string;
}

function parseGuardsCSV(text: string): { rows: NewGuardInput[]; errors: string[] } {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const errors: string[] = [];
  if (lines.length < 2) {
    return { rows: [], errors: ['The file has no data rows.'] };
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const required = ['firstname', 'lastname', 'email', 'phone', 'hourlyrate'];
  const missing = required.filter(r => !headers.includes(r));
  if (missing.length > 0) {
    return { rows: [], errors: [`Missing column(s): ${missing.join(', ')}`] };
  }

  const rows: NewGuardInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',').map(c => c.trim());
    const get = (key: string) => cells[headers.indexOf(key)] ?? '';
    const hourlyRate = Number(get('hourlyrate'));
    const firstName = get('firstname');
    const lastName = get('lastname');
    const email = get('email');
    const phone = get('phone');

    if (!firstName || !lastName || !email || !phone || !Number.isFinite(hourlyRate) || hourlyRate <= 0) {
      errors.push(`Row ${i + 1}: missing or invalid data`);
      continue;
    }
    rows.push({ firstName, lastName, email, phone, hourlyRate });
  }
  return { rows, errors };
}

export default function CompanyGuardsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRate, setInviteRate] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedFile, setImportedFile] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [companyGuards, setCompanyGuards] = useState<Guard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGuards = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await userService.listGuardsForCompany(user.id);
      setCompanyGuards(result as Guard[]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadGuards();
    }, [loadGuards])
  );

  const createGuardsRemote = async (guards: NewGuardInput[]): Promise<CreateGuardResult[]> => {
    const call = httpsCallable(getFunctions(), 'createCompanyGuards');
    const response = await call({ guards });
    const data = response.data as { results: CreateGuardResult[] };

    // Firebase Auth sends this email itself, free, using its built-in
    // template — no third-party email service needed. Admin SDK can create
    // the account but can't trigger that email, only the client SDK can.
    await Promise.all(
      data.results
        .filter(r => r.success)
        .map(r => sendPasswordResetEmail(getAuth(), r.email).catch((e) =>
          console.error('[CompanyGuards] Failed to send reset email to', r.email, e)
        ))
    );

    return data.results;
  };

  const handleSendInvite = async () => {
    const hourlyRate = Number(inviteRate);
    if (!inviteFirstName || !inviteLastName || !inviteEmail || !invitePhone || !Number.isFinite(hourlyRate) || hourlyRate <= 0) {
      Alert.alert('Error', 'Please fill in all fields with a valid hourly rate.');
      return;
    }

    setIsInviting(true);
    try {
      const [result] = await createGuardsRemote([
        { firstName: inviteFirstName, lastName: inviteLastName, email: inviteEmail, phone: invitePhone, hourlyRate },
      ]);
      if (result.success) {
        setInviteFirstName('');
        setInviteLastName('');
        setInviteEmail('');
        setInvitePhone('');
        setInviteRate('');
        setShowInviteForm(false);
        await loadGuards();
        Alert.alert('Guard Added', `${inviteEmail} was created and sent an email to set their password.`);
      } else {
        Alert.alert('Error', result.error || 'Failed to create guard account.');
      }
    } catch (error: any) {
      console.error('[CompanyGuards] Failed to create guard:', error);
      Alert.alert('Error', error.message || 'Failed to create guard account.');
    } finally {
      setIsInviting(false);
    }
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
          onPress: async () => {
            try {
              await userService.removeGuardFromCompany(guardId);
              await loadGuards();
              Alert.alert('Success', `${guardName} has been removed from your company.`);
            } catch (error) {
              console.error('[CompanyGuards] Failed to remove guard:', error);
              Alert.alert('Error', `Failed to remove ${guardName}. Please try again.`);
            }
          },
        },
      ]
    );
  };

  const handlePickCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setImportedFile(file);
        setShowImportModal(true);
      }
    } catch (error) {
      console.error('[CSV Import] Error picking file:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const handleCopyFormat = async () => {
    await Clipboard.setStringAsync(CSV_TEMPLATE);
    Alert.alert('Copied', 'The required CSV format was copied to your clipboard.');
  };

  const handleImportCSV = async () => {
    if (!importedFile) return;

    setImporting(true);
    try {
      const text = await fetch(importedFile.uri).then(r => r.text());
      const { rows, errors: parseErrors } = parseGuardsCSV(text);

      if (rows.length === 0) {
        Alert.alert('Nothing to Import', parseErrors[0] || 'No valid rows found in the file.');
        return;
      }

      const results = await createGuardsRemote(rows);
      const successCount = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success);
      const failedLines = [...parseErrors, ...failed.map(f => `${f.email}: ${f.error}`)];

      await loadGuards();
      setShowImportModal(false);
      setImportedFile(null);

      Alert.alert(
        successCount > 0 ? 'Import Complete' : 'Import Failed',
        `${successCount} of ${rows.length} guard(s) created.` +
          (failedLines.length > 0 ? `\n\nIssues:\n${failedLines.join('\n')}` : '')
      );
    } catch (error: any) {
      console.error('[CSV Import] Error:', error);
      Alert.alert('Error', error.message || 'Failed to import CSV file');
    } finally {
      setImporting(false);
    }
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
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.importButton}
            onPress={handlePickCSV}
          >
            <Upload size={18} color={Colors.gold} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => setShowInviteForm(!showInviteForm)}
          >
            <UserPlus size={20} color={Colors.background} />
            <Text style={styles.inviteButtonText}>Invite</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {showInviteForm && (
          <View style={styles.inviteForm}>
            <Text style={styles.formTitle}>Add New Guard</Text>
            <Text style={styles.formSubtitle}>
              Creates their account now and emails them a link to set their password.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Juan"
                placeholderTextColor={Colors.textTertiary}
                value={inviteFirstName}
                onChangeText={setInviteFirstName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Perez"
                placeholderTextColor={Colors.textTertiary}
                value={inviteLastName}
                onChangeText={setInviteLastName}
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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="+525512345678"
                placeholderTextColor={Colors.textTertiary}
                value={invitePhone}
                onChangeText={setInvitePhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hourly Rate (MXN)</Text>
              <TextInput
                style={styles.input}
                placeholder="180"
                placeholderTextColor={Colors.textTertiary}
                value={inviteRate}
                onChangeText={setInviteRate}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowInviteForm(false);
                  setInviteFirstName('');
                  setInviteLastName('');
                  setInviteEmail('');
                  setInvitePhone('');
                  setInviteRate('');
                }}
                disabled={isInviting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, isInviting && styles.modalImportButtonDisabled]}
                onPress={handleSendInvite}
                disabled={isInviting}
              >
                {isInviting ? (
                  <ActivityIndicator size="small" color={Colors.background} />
                ) : (
                  <>
                    <Mail size={18} color={Colors.background} />
                    <Text style={styles.sendButtonText}>Create Account</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Guards</Text>
          {isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={Colors.gold} />
            </View>
          ) : companyGuards.length === 0 ? (
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
                    style={styles.documentsButton}
                    onPress={() => router.push(`/company-guard-documents/${guard.id}` as any)}
                  >
                    <FolderOpen size={14} color={Colors.gold} />
                    <Text style={styles.documentsButtonText}>Documents</Text>
                  </TouchableOpacity>
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

      {showImportModal && importedFile && (
        <View style={styles.modalOverlay}>
          <View style={styles.importModal}>
            <View style={styles.modalHeader}>
              <FileText size={32} color={Colors.gold} />
              <Text style={styles.modalTitle}>Import CSV</Text>
            </View>

            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{importedFile.name}</Text>
              <Text style={styles.fileSize}>
                {(importedFile.size / 1024).toFixed(2)} KB
              </Text>
            </View>

            <View style={styles.csvInstructions}>
              <Text style={styles.instructionsTitle}>Required CSV Format:</Text>
              <Text style={styles.instructionsText}>{CSV_TEMPLATE}</Text>
              <Text style={styles.instructionsNote}>
                Each guard is created with an account and emailed a link to set their password.
              </Text>
              <TouchableOpacity style={styles.copyFormatButton} onPress={handleCopyFormat}>
                <Copy size={14} color={Colors.gold} />
                <Text style={styles.copyFormatText}>Copy Format</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowImportModal(false);
                  setImportedFile(null);
                }}
                disabled={importing}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalImportButton, importing && styles.modalImportButtonDisabled]}
                onPress={handleImportCSV}
                disabled={importing}
              >
                {importing ? (
                  <ActivityIndicator size="small" color={Colors.background} />
                ) : (
                  <>
                    <Upload size={18} color={Colors.background} />
                    <Text style={styles.modalImportText}>Import</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  documentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  documentsButtonText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  importButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  importModal: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 12,
  },
  fileInfo: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  csvInstructions: {
    backgroundColor: Colors.gold + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  instructionsNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
    marginBottom: 12,
  },
  copyFormatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start' as const,
  },
  copyFormatText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  modalImportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 12,
  },
  modalImportButtonDisabled: {
    opacity: 0.6,
  },
  modalImportText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
});
