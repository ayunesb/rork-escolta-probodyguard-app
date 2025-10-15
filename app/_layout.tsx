import React from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LocationTrackingProvider } from "@/contexts/LocationTrackingContext";
import { RorkErrorBoundary as RootErrorBoundary } from "@/components/ErrorBoundary";
import { initSentry } from "@/services/sentryService";
import { analyticsService } from "@/services/analyticsService";
import { appCheckService } from "@/services/appCheckService";

// Initialize monitoring services
const initializeMonitoring = async () => {
  try {
    // Initialize Sentry for error tracking
    initSentry();
    
    // Initialize Firebase Analytics
    await analyticsService.initialize();
    
    // Initialize App Check for security (skip in web development to avoid 400 errors)
    if (Platform.OS !== 'web' || !__DEV__) {
      await appCheckService.initialize();
    } else {
      console.log('[AppCheck] Skipped in web development mode');
    }
    
    console.log('All monitoring services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize monitoring services:', error);
  }
};

// Initialize monitoring on app start
initializeMonitoring();

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
