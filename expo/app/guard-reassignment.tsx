import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Shield, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { mockGuards } from '@/mocks/guards';
import type { GuardReassignment } from '@/types';

export default function GuardReassignmentScreen() {
  const { bookingId, currentGuardId } = useLocalSearchParams<{
    bookingId: string;
    currentGuardId: string;
  }>();
  
  const router = useRouter();
  const [selectedGuardId, setSelectedGuardId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const currentGuard = mockGuards.find(g => g.id === currentGuardId);
  const availableGuards = mockGuards.filter(g => 
    g.id !== currentGuardId && 
    g.availability && 
    !g.isFreelancer
  );

  const handleRequestReassignment = () => {
    if (!selectedGuardId || !reason.trim()) {
      Alert.alert('Missing Information', 'Please select a guard and provide a reason');
      return;
    }

    const reassignment: Partial<GuardReassignment> = {
      bookingId: bookingId || '',
      originalGuardId: currentGuardId || '',
      newGuardId: selectedGuardId,
      reason: reason.trim(),
      status: 'pending_client_approval',
      requestedAt: new Date().toISOString(),
    };

    console.log('Reassignment request:', reassignment);
    
    Alert.alert(
      'Reassignment Requested',
      'The client will be notified and must approve this change.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (showConfirmation) {
    const newGuard = mockGuards.find(g => g.id === selectedGuardId);
    
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Confirm Reassignment',
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.textPrimary,
            headerShadowVisible: false,
          }}
        />

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.confirmationCard}>
            <AlertCircle size={48} color={Colors.warning} />
            <Text style={styles.confirmationTitle}>Client Approval Required</Text>
            <Text style={styles.confirmationText}>
              This reassignment requires client approval. The client will be notified and can accept or reject the change.
            </Text>
          </View>

          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>Current Guard</Text>
            {currentGuard && (
              <View style={styles.guardCompactCard}>
                <Image source={{ uri: currentGuard.photos[0] }} style={styles.guardCompactImage} />
                <View style={styles.guardCompactInfo}>
                  <Text style={styles.guardCompactName}>
                    {currentGuard.firstName} {currentGuard.lastName.charAt(0)}.
                  </Text>
                  <View style={styles.ratingRow}>
                    <Star size={12} color={Colors.gold} fill={Colors.gold} />
                    <Text style={styles.ratingText}>{currentGuard.rating.toFixed(1)}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.arrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>

            <Text style={styles.comparisonTitle}>New Guard</Text>
            {newGuard && (
              <View style={styles.guardCompactCard}>
                <Image source={{ uri: newGuard.photos[0] }} style={styles.guardCompactImage} />
                <View style={styles.guardCompactInfo}>
                  <Text style={styles.guardCompactName}>
                    {newGuard.firstName} {newGuard.lastName.charAt(0)}.
                  </Text>
                  <View style={styles.ratingRow}>
                    <Star size={12} color={Colors.gold} fill={Colors.gold} />
                    <Text style={styles.ratingText}>{newGuard.rating.toFixed(1)}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={styles.reasonCard}>
            <Text style={styles.reasonTitle}>Reason for Reassignment</Text>
            <Text style={styles.reasonText}>{reason}</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowConfirmation(false)}
            >
              <Text style={styles.cancelButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleRequestReassignment}
            >
              <Text style={styles.confirmButtonText}>Send Request</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Reassign Guard',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <AlertCircle size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            Select a new guard from your roster. The client must approve this change.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Guard</Text>
          {currentGuard && (
            <View style={styles.guardCard}>
              <Image source={{ uri: currentGuard.photos[0] }} style={styles.guardImage} />
              <View style={styles.guardInfo}>
                <Text style={styles.guardName}>
                  {currentGuard.firstName} {currentGuard.lastName.charAt(0)}.
                </Text>
                <View style={styles.ratingRow}>
                  <Star size={14} color={Colors.gold} fill={Colors.gold} />
                  <Text style={styles.ratingText}>{currentGuard.rating.toFixed(1)}</Text>
                  <Text style={styles.jobsText}>({currentGuard.completedJobs} jobs)</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select New Guard</Text>
          {availableGuards.map((guard) => (
            <TouchableOpacity
              key={guard.id}
              style={[
                styles.guardCard,
                selectedGuardId === guard.id && styles.guardCardSelected,
              ]}
              onPress={() => setSelectedGuardId(guard.id)}
            >
              <Image source={{ uri: guard.photos[0] }} style={styles.guardImage} />
              <View style={styles.guardInfo}>
                <Text style={styles.guardName}>
                  {guard.firstName} {guard.lastName.charAt(0)}.
                </Text>
                <View style={styles.ratingRow}>
                  <Star size={14} color={Colors.gold} fill={Colors.gold} />
                  <Text style={styles.ratingText}>{guard.rating.toFixed(1)}</Text>
                  <Text style={styles.jobsText}>({guard.completedJobs} jobs)</Text>
                </View>
              </View>
              {selectedGuardId === guard.id && (
                <CheckCircle size={24} color={Colors.success} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Reassignment *</Text>
          <TextInput
            style={styles.reasonInput}
            value={reason}
            onChangeText={setReason}
            placeholder="Explain why this reassignment is necessary..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, (!selectedGuardId || !reason.trim()) && styles.submitButtonDisabled]}
          onPress={() => setShowConfirmation(true)}
          disabled={!selectedGuardId || !reason.trim()}
        >
          <Text style={styles.submitButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.info + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.info,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
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
  guardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guardCardSelected: {
    borderColor: Colors.success,
    borderWidth: 2,
  },
  guardImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
  },
  guardInfo: {
    flex: 1,
  },
  guardName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  jobsText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  reasonInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top' as const,
  },
  submitButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  confirmationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  confirmationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  comparisonCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  guardCompactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  guardCompactImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: Colors.surfaceLight,
  },
  guardCompactInfo: {
    flex: 1,
  },
  guardCompactName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  arrow: {
    alignItems: 'center',
    marginVertical: 8,
  },
  arrowText: {
    fontSize: 24,
    color: Colors.gold,
  },
  reasonCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
});
