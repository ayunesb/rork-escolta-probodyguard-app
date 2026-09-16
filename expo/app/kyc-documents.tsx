import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import KYCDocumentUpload, { DocumentType } from '@/components/KYCDocumentUpload';
import type { Guard, User } from '@/types';
import Colors from '@/constants/colors';

type DocField = 'photos' | 'governmentIdUrls' | 'licenseUrls' | 'vehicleDocUrls' | 'insuranceUrls' | 'outfitPhotos';

const KYC_DOCUMENT_TYPES: DocumentType[] = ['id', 'license', 'vehicle', 'insurance', 'outfit'];

export default function KYCDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updateUser } = useAuth() as {
    user: Guard | null;
    updateUser: (updates: Partial<User>) => Promise<void>;
  };
  const [isSaving, setIsSaving] = useState(false);

  if (!user || user.role !== 'guard') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>This screen is for guard accounts only.</Text>
        </View>
      </View>
    );
  }

  // Documents/{scopeId}/{userId}/... en Storage: scopeId es el companyId si
  // el escolta pertenece a una empresa, o su propio uid si es independiente.
  const scopeId = user.companyId || user.id;

  const handleFieldUpdate = async (
    field: DocField,
    documentType: DocumentType,
    urls: string[]
  ) => {
    setIsSaving(true);
    try {
      const updates: Partial<Guard> = { [field]: urls };
      if (KYC_DOCUMENT_TYPES.includes(documentType) && user.kycStatus !== 'pending') {
        // Any change to an actual KYC document sends it back for review.
        updates.kycStatus = 'pending';
      }
      await updateUser(updates);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Documents</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.statusBanner}>
        {user.kycStatus === 'approved' ? (
          <CheckCircle size={18} color={Colors.success} />
        ) : (
          <AlertCircle size={18} color={Colors.warning} />
        )}
        <Text style={styles.statusText}>
          {user.kycStatus === 'approved'
            ? 'Your documents are verified.'
            : user.kycStatus === 'rejected'
            ? 'Your last submission was rejected. Upload updated documents to resubmit.'
            : 'Your documents are pending review.'}
        </Text>
        {isSaving && <ActivityIndicator size="small" color={Colors.gold} />}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <KYCDocumentUpload
          userId={user.id}
          scopeId={scopeId}
          documentType="photo"
          label="Profile Photo"
          description="A clear photo of your face, shown to clients."
          maxImages={1}
          initialImages={user.photos ?? []}
          onUpload={(urls) => handleFieldUpdate('photos', 'photo', urls)}
        />

        <KYCDocumentUpload
          userId={user.id}
          scopeId={scopeId}
          documentType="id"
          label="Government ID"
          description="A valid government-issued photo ID."
          maxImages={2}
          initialImages={user.governmentIdUrls ?? []}
          onUpload={(urls) => handleFieldUpdate('governmentIdUrls', 'id', urls)}
        />

        <KYCDocumentUpload
          userId={user.id}
          scopeId={scopeId}
          documentType="license"
          label="Security License"
          description="Your private security license or credential."
          maxImages={2}
          initialImages={user.licenseUrls ?? []}
          onUpload={(urls) => handleFieldUpdate('licenseUrls', 'license', urls)}
        />

        <KYCDocumentUpload
          userId={user.id}
          scopeId={scopeId}
          documentType="insurance"
          label="Insurance"
          description="Proof of liability insurance, if applicable."
          maxImages={2}
          initialImages={user.insuranceUrls ?? []}
          onUpload={(urls) => handleFieldUpdate('insuranceUrls', 'insurance', urls)}
        />

        <KYCDocumentUpload
          userId={user.id}
          scopeId={scopeId}
          documentType="vehicle"
          label="Vehicle Documents"
          description="Registration and insurance for your vehicle, if you provide one."
          maxImages={3}
          initialImages={user.vehicleDocUrls ?? []}
          onUpload={(urls) => handleFieldUpdate('vehicleDocUrls', 'vehicle', urls)}
        />

        <KYCDocumentUpload
          userId={user.id}
          scopeId={scopeId}
          documentType="outfit"
          label="Outfit Photos"
          description="Photos of your uniform or work attire."
          maxImages={3}
          initialImages={user.outfitPhotos ?? []}
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
