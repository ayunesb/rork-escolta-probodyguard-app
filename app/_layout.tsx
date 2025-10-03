import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LocationTrackingProvider } from "@/contexts/LocationTrackingContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="guard/[id]" options={{ headerShown: true, title: "Guard Profile" }} />
      <Stack.Screen name="booking/create" options={{ headerShown: true, title: "Book Guard" }} />
      <Stack.Screen name="booking/[id]" options={{ headerShown: true, title: "Booking Details" }} />
      <Stack.Screen name="booking/pending" options={{ headerShown: true, title: "Pending Booking" }} />
      <Stack.Screen name="booking/rate/[id]" options={{ headerShown: true, title: "Rate Service" }} />
      <Stack.Screen name="tracking/[bookingId]" options={{ headerShown: true, title: "Live Tracking" }} />
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
