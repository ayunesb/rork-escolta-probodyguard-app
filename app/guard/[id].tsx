import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Shield,
  Star,
  MapPin,
  Languages,
  Award,
  Weight,
  Ruler,
  ChevronLeft,
  TrendingUp,
  Clock,
  MessageCircle,
  Mic,
} from 'lucide-react-native';
import { mockGuards } from '@/mocks/guards';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function GuardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  const guard = mockGuards.find((g) => g.id === id);

  if (!guard) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Shield size={64} color={Colors.textTertiary} />
          <Text style={styles.errorText}>Guard not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: guard.photos[selectedPhotoIndex] }} style={styles.mainImage} />
          
          <TouchableOpacity style={[styles.backButton, { top: insets.top + 10 }]} onPress={() => router.back()}>
            <ChevronLeft size={24} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.photoIndicators}>
            {guard.photos.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.photoIndicator,
                  selectedPhotoIndex === idx && styles.photoIndicatorActive,
                ]}
                onPress={() => setSelectedPhotoIndex(idx)}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>
                {guard.firstName} {guard.lastName.charAt(0)}.
              </Text>
              <View style={styles.ratingRow}>
                <Star size={16} color={Colors.gold} fill={Colors.gold} />
                <Text style={styles.ratingText}>{guard.rating.toFixed(1)}</Text>
                <Text style={styles.jobsText}>({guard.completedJobs} jobs)</Text>
              </View>
            </View>
            <View style={styles.verifiedBadge}>
              <Shield size={18} color={Colors.gold} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Ruler size={20} color={Colors.gold} />
              <Text style={styles.statValue}>{guard.height} cm</Text>
              <Text style={styles.statLabel}>Height</Text>
            </View>
            <View style={styles.statBox}>
              <Weight size={20} color={Colors.gold} />
              <Text style={styles.statValue}>{guard.weight} kg</Text>
              <Text style={styles.statLabel}>Weight</Text>
            </View>
            <View style={styles.statBox}>
              <Languages size={20} color={Colors.gold} />
              <Text style={styles.statValue}>{guard.languages.length}</Text>
              <Text style={styles.statLabel}>Languages</Text>
            </View>
            <View style={styles.statBox}>
              <Award size={20} color={Colors.gold} />
              <Text style={styles.statValue}>{guard.certifications.length}</Text>
              <Text style={styles.statLabel}>Certs</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{guard.bio}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.languageList}>
              {guard.languages.map((lang, idx) => (
                <View key={idx} style={styles.languageBadge}>
                  <Languages size={14} color={Colors.gold} />
                  <Text style={styles.languageText}>{lang.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.certList}>
              {guard.certifications.map((cert, idx) => (
                <View key={idx} style={styles.certItem}>
                  <Award size={16} color={Colors.gold} />
                  <Text style={styles.certItemText}>{cert}</Text>
                </View>
              ))}
            </View>
          </View>

          {guard.ratingBreakdown && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rating Breakdown</Text>
              <View style={styles.ratingBreakdownContainer}>
                <View style={styles.ratingItem}>
                  <View style={styles.ratingItemHeader}>
                    <TrendingUp size={16} color={Colors.gold} />
                    <Text style={styles.ratingItemLabel}>Professionalism</Text>
                  </View>
                  <View style={styles.ratingBar}>
                    <View style={[styles.ratingBarFill, { width: `${(guard.ratingBreakdown.professionalism / 5) * 100}%` }]} />
                  </View>
                  <Text style={styles.ratingItemValue}>{guard.ratingBreakdown.professionalism.toFixed(1)}</Text>
                </View>

                <View style={styles.ratingItem}>
                  <View style={styles.ratingItemHeader}>
                    <Clock size={16} color={Colors.gold} />
                    <Text style={styles.ratingItemLabel}>Punctuality</Text>
                  </View>
                  <View style={styles.ratingBar}>
                    <View style={[styles.ratingBarFill, { width: `${(guard.ratingBreakdown.punctuality / 5) * 100}%` }]} />
                  </View>
                  <Text style={styles.ratingItemValue}>{guard.ratingBreakdown.punctuality.toFixed(1)}</Text>
                </View>

                <View style={styles.ratingItem}>
                  <View style={styles.ratingItemHeader}>
                    <MessageCircle size={16} color={Colors.gold} />
                    <Text style={styles.ratingItemLabel}>Communication</Text>
                  </View>
                  <View style={styles.ratingBar}>
                    <View style={[styles.ratingBarFill, { width: `${(guard.ratingBreakdown.communication / 5) * 100}%` }]} />
                  </View>
                  <Text style={styles.ratingItemValue}>{guard.ratingBreakdown.communication.toFixed(1)}</Text>
                </View>

                <View style={styles.ratingItem}>
                  <View style={styles.ratingItemHeader}>
                    <Mic size={16} color={Colors.gold} />
                    <Text style={styles.ratingItemLabel}>Language Clarity</Text>
                  </View>
                  <View style={styles.ratingBar}>
                    <View style={[styles.ratingBarFill, { width: `${(guard.ratingBreakdown.languageClarity / 5) * 100}%` }]} />
                  </View>
                  <Text style={styles.ratingItemValue}>{guard.ratingBreakdown.languageClarity.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationRow}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.locationText}>
                {guard.availability ? 'Available now' : 'Currently unavailable'}
              </Text>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting at</Text>
          <Text style={styles.priceValue}>${guard.hourlyRate} MXN/hr</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => router.push({ pathname: '/booking/create', params: { guardId: guard.id } })}
        >
          <Text style={styles.bookButtonText}>Book Protection</Text>
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
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: width * 1.2,
    position: 'relative' as const,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceLight,
  },
  backButton: {
    position: 'absolute' as const,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIndicators: {
    position: 'absolute' as const,
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white + '40',
  },
  photoIndicatorActive: {
    backgroundColor: Colors.white,
    width: 24,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  jobsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gold + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
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
  bio: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  languageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  languageText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  certList: {
    gap: 12,
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  certItemText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  bookButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  ratingBreakdownContainer: {
    gap: 16,
  },
  ratingItem: {
    gap: 8,
  },
  ratingItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingItemLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  ratingItemValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
    position: 'absolute' as const,
    right: 0,
    top: 0,
  },
  ratingBar: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 3,
  },
});
