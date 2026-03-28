import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Star, ChevronLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function BookingRatingScreen() {
  const params = useLocalSearchParams<{
    bookingId: string;
    guardId: string;
    guardName: string;
    guardPhoto: string;
  }>();
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }

    try {
      const ratingData = {
        bookingId: params.bookingId,
        guardId: params.guardId,
        overallRating: rating,
        professionalismRating,
        punctualityRating,
        communicationRating,
        qualityRating,
        review,
        timestamp: new Date().toISOString(),
      };

      const existingRatings = await AsyncStorage.getItem('@escolta_ratings');
      const ratings = existingRatings ? JSON.parse(existingRatings) : [];
      ratings.push(ratingData);
      await AsyncStorage.setItem('@escolta_ratings', JSON.stringify(ratings));

      console.log('Rating submitted:', ratingData);

      Alert.alert(
        'Thank You!',
        'Your feedback helps us maintain the highest standards of protection services.',
        [
          {
            text: 'Done',
            onPress: () => {
              router.replace('/bookings' as any);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.guardCard}>
          <Image source={{ uri: params.guardPhoto }} style={styles.guardImage} />
          <Text style={styles.guardName}>{params.guardName}</Text>
          <Text style={styles.guardRole}>Executive Protection Specialist</Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>How was your experience?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Star
                  size={48}
                  color={star <= rating ? Colors.gold : Colors.border}
                  fill={star <= rating ? Colors.gold : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
            </Text>
          )}
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Share your feedback (optional)</Text>
          <TextInput
            style={styles.reviewInput}
            value={review}
            onChangeText={setReview}
            placeholder="Tell us about your experience..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={6}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{review.length}/500</Text>
        </View>

        <View style={styles.detailedRatings}>
          <Text style={styles.detailedTitle}>Detailed Ratings (Optional)</Text>
          
          <View style={styles.detailedItem}>
            <Text style={styles.detailedLabel}>Professionalism</Text>
            <View style={styles.miniStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setProfessionalismRating(star)}
                >
                  <Star
                    size={24}
                    color={star <= professionalismRating ? Colors.gold : Colors.border}
                    fill={star <= professionalismRating ? Colors.gold : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.detailedItem}>
            <Text style={styles.detailedLabel}>Punctuality</Text>
            <View style={styles.miniStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setPunctualityRating(star)}
                >
                  <Star
                    size={24}
                    color={star <= punctualityRating ? Colors.gold : Colors.border}
                    fill={star <= punctualityRating ? Colors.gold : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.detailedItem}>
            <Text style={styles.detailedLabel}>Communication</Text>
            <View style={styles.miniStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setCommunicationRating(star)}
                >
                  <Star
                    size={24}
                    color={star <= communicationRating ? Colors.gold : Colors.border}
                    fill={star <= communicationRating ? Colors.gold : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.detailedItem}>
            <Text style={styles.detailedLabel}>Service Quality</Text>
            <View style={styles.miniStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setQualityRating(star)}
                >
                  <Star
                    size={24}
                    color={star <= qualityRating ? Colors.gold : Colors.border}
                    fill={star <= qualityRating ? Colors.gold : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0}
        >
          <Text style={styles.submitButtonText}>Submit Rating</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace('/bookings' as any)}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  guardCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guardImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surfaceLight,
    marginBottom: 16,
  },
  guardName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  guardRole: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.gold,
    marginTop: 16,
  },
  reviewSection: {
    marginBottom: 32,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  reviewInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right' as const,
    marginTop: 8,
  },
  tipsSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  detailedRatings: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailedTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  detailedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailedLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  miniStars: {
    flexDirection: 'row',
    gap: 4,
  },
  submitButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
});
