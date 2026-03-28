import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Upload, X, CheckCircle, FileText } from 'lucide-react-native';
import Colors from '@/constants/colors';

export type DocumentType = 'id' | 'license' | 'vehicle' | 'insurance' | 'outfit';

interface KYCDocumentUploadProps {
  documentType: DocumentType;
  label: string;
  description?: string;
  maxImages?: number;
  onUpload: (uris: string[]) => void;
  initialImages?: string[];
}

export default function KYCDocumentUpload({
  documentType,
  label,
  description,
  maxImages = 1,
  onUpload,
  initialImages = [],
}: KYCDocumentUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS === 'web') {
      return true;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload documents.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      if (images.length >= maxImages) {
        Alert.alert(
          'Maximum Reached',
          `You can only upload ${maxImages} ${maxImages === 1 ? 'image' : 'images'} for this document.`,
          [{ text: 'OK' }]
        );
        return;
      }

      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: documentType === 'id' || documentType === 'license',
        aspect: documentType === 'id' || documentType === 'license' ? [4, 3] : undefined,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImages = [...images, result.assets[0].uri];
        setImages(newImages);
        onUpload(newImages);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const takePhoto = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Not Supported', 'Camera is not supported on web. Please use image picker.');
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera permissions to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (images.length >= maxImages) {
        Alert.alert(
          'Maximum Reached',
          `You can only upload ${maxImages} ${maxImages === 1 ? 'image' : 'images'} for this document.`,
          [{ text: 'OK' }]
        );
        return;
      }

      setUploading(true);

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: documentType === 'id' || documentType === 'license',
        aspect: documentType === 'id' || documentType === 'license' ? [4, 3] : undefined,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImages = [...images, result.assets[0].uri];
        setImages(newImages);
        onUpload(newImages);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onUpload(newImages);
  };

  const showUploadOptions = () => {
    if (Platform.OS === 'web') {
      pickImage();
      return;
    }

    Alert.alert(
      'Upload Document',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <FileText size={20} color={Colors.gold} />
          <Text style={styles.label}>{label}</Text>
        </View>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      {images.length > 0 && (
        <View style={styles.imagesGrid}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <X size={16} color={Colors.background} />
              </TouchableOpacity>
              <View style={styles.uploadedBadge}>
                <CheckCircle size={16} color={Colors.success} />
              </View>
            </View>
          ))}
        </View>
      )}

      {images.length < maxImages && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={showUploadOptions}
          disabled={uploading}
        >
          <Upload size={24} color={Colors.gold} />
          <Text style={styles.uploadButtonText}>
            {uploading ? 'Uploading...' : images.length > 0 ? 'Add Another' : 'Upload Document'}
          </Text>
          {maxImages > 1 && (
            <Text style={styles.uploadButtonSubtext}>
              {images.length}/{maxImages} uploaded
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative' as const,
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceLight,
  },
  removeButton: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedBadge: {
    position: 'absolute' as const,
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed' as const,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  uploadButtonSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
