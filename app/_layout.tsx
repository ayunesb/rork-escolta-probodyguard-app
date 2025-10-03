import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LocationTrackingProvider, useLocationTracking } from "@/contexts/LocationTrackingContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const { setRole } = useLocationTracking();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setRole(user.role);
    } else {
      setRole(null);
    }
  }, [user]);

  useEffect(() => {
    if (isLoading) return;

    const firstSegment = segments[0];
    const inAuthGroup = firstSegment === 'auth';
    const inTabsGroup = firstSegment === '(tabs)';
    const isIndexRoute = !firstSegment || firstSegment === 'index';

    if (!user && !inAuthGroup && !isIndexRoute) {
      router.replace('/auth/sign-in');
    } else if (user && !inTabsGroup && (isIndexRoute || inAuthGroup)) {
      router.replace('/(tabs)/home');
    }
  }, [user, isLoading, segments]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <FavoritesProvider>
            <LocationTrackingProvider>
              <RootLayoutNav />
            </LocationTrackingProvider>
          </FavoritesProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
