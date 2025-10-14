import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LocationTrackingProvider } from "@/contexts/LocationTrackingContext";
import { RorkErrorBoundary as RootErrorBoundary } from "@/components/ErrorBoundary";
import { initSentry, SentryErrorBoundary } from "@/services/sentryService";

// Initialize Sentry
initSentry();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <AuthProvider>
              <LanguageProvider>
                <NotificationProvider>
                  <LocationTrackingProvider>
                    <Stack
                      screenOptions={{
                        headerShown: false,
                      }}
                    />
                  </LocationTrackingProvider>
                </NotificationProvider>
              </LanguageProvider>
            </AuthProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </RootErrorBoundary>
  );
}
