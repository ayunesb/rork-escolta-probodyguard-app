import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { guardService } from '@/services/guardService';
import { userService } from '@/services/userService';
import KYCDocumentUpload, { DocumentType } from '@/components/KYCDocumentUpload';
import type { Guard } from '@/types';
import Colors from '@/constants/colors';

type DocField = 'photos' | 'governmentIdUrls' | 'licenseUrls' | 'vehicleDocUrls' | 'insuranceUrls' | 'outfitPhotos';

const KYC_DOCUMENT_TYPES: DocumentType[] = ['id', 'license', 'vehicle', 'insurance', 'outfit'];

export default function CompanyGuardDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { guardId } = useLocalSearchParams<{ guardId: string }>();
  const { user } = useAuth();
  const [guard, setGuard] = useState<Guard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadGuard = useCallback(async () => {
    if (!guardId) return;
    setIsLoading(true);
    try {
      const result = await guardService.getGuardById(guardId);
      setGuard(result);
    } finally {
      setIsLoading(false);
    }
  }, [guardId]);

  useFocusEffect(
    useCallback(() => {
      loadGuard();
    }, [loadGuard])
  );

  const canManage =
    !!user && !!guard && (user.role === 'admin' || (user.role === 'company' && guard.companyId === user.id));

  const handleFieldUpdate = async (field: DocField, documentType: DocumentType, urls: string[]) => {
    if (!guard) return;
    setIsSaving(true);
    try {
      const updates: Partial<Guard> = { [field]: urls };
      if (KYC_DOCUMENT_TYPES.includes(documentType) && guard.kycStatus !== 'pending') {
        updates.kycStatus = 'pending';
      }
      await userService.updateGuardDocuments(guard.id, updates);
      setGuard({ ...guard, ...updates });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      </View>
    );
  }

  if (!guard || !canManage) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {guard ? 'You do not have access to this guard\'s documents.' : 'Guard not found.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {guard.firstName} {guard.lastName}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.statusBanner}>
        {guard.kycStatus === 'approved' ? (
          <CheckCircle size={18} color={Colors.success} />
        ) : (
          <AlertCircle size={18} color={Colors.warning} />
        )}
        <Text style={styles.statusText}>
          {guard.kycStatus === 'approved'
            ? 'Documents verified.'
            : guard.kycStatus === 'rejected'
            ? 'Last submission was rejected. Upload updated documents to resubmit.'
            : 'Documents pending review.'}
        </Text>
        {isSaving && <ActivityIndicator size="small" color={Colors.gold} />}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <KYCDocumentUpload
          userId={guard.id}
          documentType="photo"
          label="Profile Photo"
          description="A clear photo of the guard's face, shown to clients."
          maxImages={1}
          initialImages={guard.photos ?? []}
          onUpload={(urls) => handleFieldUpdate('photos', 'photo', urls)}
        />

        <KYCDocumentUpload
          userId={guard.id}
          documentType="id"
          label="Government ID"
          description="A valid government-issued photo ID."
          maxImages={2}
          initialImages={guard.governmentIdUrls ?? []}
          onUpload={(urls) => handleFieldUpdate('governmentIdUrls', 'id', urls)}
        />

        <KYCDocumentUpload
          userId={guard.id}
          documentType="license"
          label="Security License"
          description="Their private security license or credential."
          maxImages={2}
          initialImages={guard.licenseUrls ?? []}
          onUpload={(urls) => handleFieldUpdate('licenseUrls', 'license', urls)}
        />

        <KYCDocumentUpload
          userId={guard.id}
          documentType="insurance"
          label="Insurance"
          description="Proof of liability insurance, if applicable."
          maxImages={2}
          initialImages={guard.insuranceUrls ?? []}
          onUpload={(urls) => handleFieldUpdate('insuranceUrls', 'insurance', urls)}
        />

        <KYCDocumentUpload
          userId={guard.id}
          documentType="vehicle"
          label="Vehicle Documents"
          description="Registration and insurance for their vehicle, if provided."
          maxImages={3}
          initialImages={guard.vehicleDocUrls ?? []}
          onUpload={(urls) => handleFieldUpdate('vehicleDocUrls', 'vehicle', urls)}
        />

        <KYCDocumentUpload
          userId={guard.id}
          documentType="outfit"
          label="Outfit Photos"
          description="Photos of their uniform or work attire."
          maxImages={3}
          initialImages={guard.outfitPhotos ?? []}
          onUpload={(urls) => handleFieldUpdate('outfitPhotos', 'outfit', urls)}
        />
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
  },
  headerSpacer: {
    width: 40,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
});
