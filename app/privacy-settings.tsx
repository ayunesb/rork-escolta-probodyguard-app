import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Share,
} from 'react-native';
import { Stack, router } from 'expo-router';

import { ChevronRight, Download, Trash2, Shield, FileText } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { gdprService } from '@/services/gdprService';

export default function PrivacySettingsScreen() {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    if (!user) return;

    Alert.alert(
      'Export Your Data',
      'This will create a complete export of all your personal data. The export will be available for download.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            try {
              setIsExporting(true);
              const exportedData = await gdprService.exportUserData(user.id);
              
              const jsonString = JSON.stringify(exportedData, null, 2);
              const fileName = `escolta-pro-data-export-${Date.now()}.json`;

              if (Platform.OS === 'web') {
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.click();
                URL.revokeObjectURL(url);
              } else {
                await Share.share({
                  message: jsonString,
                  title: 'Data Export',
                });
              }

              Alert.alert('Success', 'Your data has been exported successfully.');
            } catch (error) {
              console.error('Export error:', error);
              Alert.alert('Error', 'Failed to export data. Please try again.');
            } finally {
              setIsExporting(false);
            }
          },
        },
      ]
    );
  };

  const handleRequestDeletion = async () => {
    if (!user) return;

    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type DELETE to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setIsDeleting(true);
                      await gdprService.requestDataDeletion(user.id, 'User requested account deletion');
                      
                      Alert.alert(
                        'Deletion Requested',
                        'Your account deletion request has been submitted. Your account will be deleted within 30 days.',
                        [
                          {
                            text: 'OK',
                            onPress: () => router.replace('/auth/sign-in'),
                          },
                        ]
                      );
                    } catch (error) {
                      console.error('Deletion error:', error);
                      Alert.alert('Error', 'Failed to request deletion. Please try again.');
                    } finally {
                      setIsDeleting(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Privacy & Data',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Your Privacy Rights</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Under GDPR and data protection laws, you have the right to access, export, and delete your personal data.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={handleExportData}
            disabled={isExporting}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#2196F3' }]}>
                {isExporting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Download size={20} color="#fff" />
                )}
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Export My Data</Text>
                <Text style={styles.optionDescription}>
                  Download a copy of all your personal data
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => router.push('/privacy-policy')}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#9C27B0' }]}>
                <FileText size={20} color="#fff" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Privacy Policy</Text>
                <Text style={styles.optionDescription}>
                  Read our privacy policy
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          <TouchableOpacity
            style={[styles.option, styles.dangerOption]}
            onPress={handleRequestDeletion}
            disabled={isDeleting}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#f44336' }]}>
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Trash2 size={20} color="#fff" />
                )}
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, styles.dangerText]}>Delete My Account</Text>
                <Text style={styles.optionDescription}>
                  Permanently delete your account and all data
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#f44336" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            We take your privacy seriously. All data is encrypted and stored securely.
          </Text>
          <Text style={styles.footerText}>
            For questions, contact: privacy@escoltapro.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    marginTop: 5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dangerOption: {
    borderWidth: 1,
    borderColor: '#f44336',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  dangerText: {
    color: '#f44336',
  },
  optionDescription: {
    fontSize: 13,
    color: '#999',
  },
  footer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
});
