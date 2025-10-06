import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LocationTrackingProvider } from "@/contexts/LocationTrackingContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { notificationService } from "@/services/notificationService";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    if (!user) return;

    console.log('[App] Initializing notifications for user:', user.id);
    notificationService.requestPermissions();
    notificationService.registerForPushNotifications(user.id);

    const cleanup = notificationService.setupNotificationListeners(
      (notification) => {
        console.log('[App] Notification received:', notification);
      },
      (response) => {
        console.log('[App] Notification tapped:', response);
        const data = response.notification.request.content.data;
        
        if (data.type === 'booking_request' && data.bookingId) {
          router.push(`/booking/${data.bookingId}` as any);
        } else if (data.bookingId) {
          router.push(`/booking/${data.bookingId}` as any);
        }
      }
    );

    return cleanup;
  }, [user, router]);

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
