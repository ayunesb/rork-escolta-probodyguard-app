import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Add debugging for the auth context
  console.log('[Index] Attempting to get auth context...');
  const authContext = useAuth();
  console.log('[Index] Auth context:', authContext);
  
  const user = authContext?.user;
  const isLoading = authContext?.isLoading ?? true;

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      console.log('[Index] User role:', user.role);
      switch (user.role) {
        case 'client':
        case 'guard':
          router.replace('/(tabs)/home');
          break;
        case 'company':
          console.log('[Index] Company role detected - routing to company dashboard');
          router.replace('/(tabs)/company-home');
          break;
        case 'admin':
          console.log('[Index] Admin role detected - routing to admin dashboard');
          router.replace('/(tabs)/admin-home');
          break;
        default:
          console.log('[Index] Unknown role, routing to home');
          router.replace('/(tabs)/home');
      }
    } else {
      router.replace('/auth/sign-in');
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
