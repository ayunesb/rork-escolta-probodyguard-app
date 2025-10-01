import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      router.replace('/auth/sign-in' as any);
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/home' as any);
    }
  }, [user, isLoading, segments, router]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
              <NotificationProvider>
                <AnalyticsProvider>
                  <RootLayoutNav />
                </AnalyticsProvider>
              </NotificationProvider>
            </AuthProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}
