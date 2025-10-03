import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      console.log('[Index] No user, redirecting to sign-in');
      router.replace('/auth/sign-in');
    } else if (user && inAuthGroup) {
      console.log('[Index] User authenticated, redirecting to home');
      router.replace('/(tabs)/home');
    } else if (user) {
      console.log('[Index] User authenticated, redirecting to home');
      router.replace('/(tabs)/home');
    }
  }, [user, isLoading, segments, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ActivityIndicator size="large" color={Colors.gold} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
