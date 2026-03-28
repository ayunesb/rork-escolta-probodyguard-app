import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // This component only handles initial app launch routing
    // After login, sign-in.tsx handles navigation directly
    if (!user) {
      console.log('[Index] No user, redirecting to sign-in');
      router.replace('/auth/sign-in');
    } else {
      // User is authenticated, redirect to appropriate home
      console.log('[Index] User authenticated, redirecting based on role:', user.role);
      switch (user.role) {
        case 'client':
        case 'bodyguard':
          router.replace('/(tabs)/home');
          break;
        case 'company':
          router.replace('/(tabs)/company-home');
          break;
        case 'admin':
          router.replace('/(tabs)/admin-home');
          break;
        default:
          router.replace('/(tabs)/home');
      }
    }
  }, [user, isLoading, router]);

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
