import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Platform, View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LocationTrackingProvider } from "@/contexts/LocationTrackingContext";
import { RorkErrorBoundary as RootErrorBoundary } from "@/components/ErrorBoundary";
import { initSentry } from "@/services/sentryService";
import { analyticsService } from "@/services/analyticsService";
import { appCheckService } from "@/services/appCheckService";
import Colors from "@/constants/colors";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[App] Starting initialization...');
        
        initSentry();
        console.log('[App] Sentry initialized');
        
        await analyticsService.initialize();
        console.log('[App] Analytics initialized');
        
        if (Platform.OS !== 'web' || !__DEV__) {
          await appCheckService.initialize();
          console.log('[App] AppCheck initialized');
        } else {
          console.log('[App] AppCheck skipped in web dev mode');
        }
        
        console.log('[App] All services initialized successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('[App] Initialization error:', error);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <AuthProvider>
              <SessionProvider>
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
              </SessionProvider>
            </AuthProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </RootErrorBoundary>
  );
}
