import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, Shield } from 'lucide-react-native';
import { bookingService } from '@/services/bookingService';
import { Booking } from '@/types';
import Colors from '@/constants/colors';

export default function RateBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [overallRating, setOverallRating] = useState<number>(0);
  const [professionalism, setProfessionalism] = useState<number>(0);
  const [punctuality, setPunctuality] = useState<number>(0);
  const [communication, setCommunication] = useState<number>(0);
  const [languageClarity, setLanguageClarity] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadBooking = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const bookingData = await bookingService.getBookingById(id);
      setBooking(bookingData);
    } catch (error) {
      console.error('[RateBooking] Error loading booking:', error);
      Alert.alert('Error', 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const handleSubmit = async () => {
    if (!booking) return;

    if (overallRating === 0) {
      Alert.alert('Rating Required', 'Please provide an overall rating');
      return;
    }

    if (professionalism === 0 || punctuality === 0 || communication === 0 || languageClarity === 0) {
      Alert.alert('All Ratings Required', 'Please rate all categories');
      return;
    }

    try {
      setSubmitting(true);
      await bookingService.rateBooking(
        booking.id,
        overallRating,
        {
          professionalism,
          punctuality,
          communication,
          languageClarity,
        },
        review.trim() || undefined
      );

      Alert.alert('Success', 'Thank you for your feedback!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('[RateBooking] Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, onPress: (value: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((value) => (
          <TouchableOpacity
            key={value}
            onPress={() => onPress(value)}
            style={styles.starButton}
          >
            <Star
              size={32}
              color={value <= rating ? Colors.gold : Colors.textTertiary}
              fill={value <= rating ? Colors.gold : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Rate Service' }} />
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Rate Service' }} />
        <View style={styles.centerContainer}>
          <Shield size={64} color={Colors.textTertiary} />
          <Text style={styles.errorText}>Booking not found</Text>
        </View>
      </View>
    );
  }

  if (booking.rating) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Rate Service' }} />
        <View style={styles.centerContainer}>
          <Shield size={64} color={Colors.gold} />
          <Text style={styles.errorText}>Already Rated</Text>
          <Text style={styles.errorSubtext}>
            You have already rated this service
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Rate Service' }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.header}>
          <Shield size={48} color={Colors.gold} />
          <Text style={styles.title}>Rate Your Experience</Text>
          <Text style={styles.subtitle}>
            Help us improve by sharing your feedback
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Rating</Text>
          {renderStars(overallRating, setOverallRating)}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professionalism</Text>
          <Text style={styles.sectionDescription}>
            How professional was the guard?
          </Text>
          {renderStars(professionalism, setProfessionalism)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Punctuality</Text>
          <Text style={styles.sectionDescription}>
            Was the guard on time?
          </Text>
          {renderStars(punctuality, setPunctuality)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>
          <Text style={styles.sectionDescription}>
            How well did the guard communicate?
          </Text>
          {renderStars(communication, setCommunication)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language Clarity</Text>
          <Text style={styles.sectionDescription}>
            How clear was the guard&apos;s language?
          </Text>
          {renderStars(languageClarity, setLanguageClarity)}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Comments (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Share your experience..."
            placeholderTextColor={Colors.textTertiary}
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 120,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
  },
  submitButton: {
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
