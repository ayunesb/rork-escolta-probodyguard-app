import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Colors from '@/constants/colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export default function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function GuardCardSkeleton() {
  return (
    <View style={styles.guardCard}>
      <SkeletonLoader width="100%" height={240} borderRadius={0} />
      <View style={styles.guardInfo}>
        <View style={styles.guardHeader}>
          <View>
            <SkeletonLoader width={150} height={24} style={{ marginBottom: 8 }} />
            <SkeletonLoader width={100} height={16} />
          </View>
          <SkeletonLoader width={80} height={32} borderRadius={12} />
        </View>
        <SkeletonLoader width="100%" height={40} style={{ marginVertical: 12 }} />
        <View style={styles.row}>
          <SkeletonLoader width={100} height={16} />
          <SkeletonLoader width={120} height={16} />
        </View>
        <View style={styles.certRow}>
          <SkeletonLoader width={80} height={28} borderRadius={8} />
          <SkeletonLoader width={100} height={28} borderRadius={8} />
        </View>
        <View style={styles.guardFooter}>
          <SkeletonLoader width={80} height={40} />
          <SkeletonLoader width={120} height={44} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}

export function BookingCardSkeleton() {
  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <SkeletonLoader width={60} height={60} borderRadius={30} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <SkeletonLoader width={120} height={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader width={180} height={16} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={150} height={16} />
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <SkeletonLoader width={100} height={16} />
        <SkeletonLoader width={80} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.surfaceLight,
  },
  guardCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guardInfo: {
    padding: 16,
  },
  guardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  certRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  guardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
});
