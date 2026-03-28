import { Tabs, Redirect } from "expo-router";
import { Shield, Calendar, User, Briefcase, Settings, LayoutDashboard, Users as UsersIcon, FileText } from "lucide-react-native";
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocationTracking } from "@/contexts/LocationTrackingContext";
import Colors from "@/constants/colors";

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const { setRole } = useLocationTracking();

  useEffect(() => {
    if (user) {
      console.log('[TabLayout] User detected:', user.email, 'role:', user.role);
      setRole(user.role);
    }
  }, [user, setRole]);

  // Show loading while auth is still initializing
  if (isLoading) {
    console.log('[TabLayout] Auth loading...');
    return null;
  }

  if (!user) {
    console.log('[TabLayout] No user, redirecting to sign-in');
    return <Redirect href="/auth/sign-in" />;
  }

  if (user.role === 'client') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.gold,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Book",
            tabBarIcon: ({ color }: { color?: string }) => <Shield size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarIcon: ({ color }: { color?: string }) => <Calendar size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }: { color?: string }) => <User size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen name="company-home" options={{ href: null }} />
        <Tabs.Screen name="company-guards" options={{ href: null }} />
        <Tabs.Screen name="admin-home" options={{ href: null }} />
        <Tabs.Screen name="admin-kyc" options={{ href: null }} />
        <Tabs.Screen name="admin-users" options={{ href: null }} />
      </Tabs>
    );
  }

  if (user.role === 'guard') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.gold,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Jobs",
            tabBarIcon: ({ color }: { color?: string }) => <Briefcase size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "History",
            tabBarIcon: ({ color }: { color?: string }) => <Calendar size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }: { color?: string }) => <Settings size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen name="company-home" options={{ href: null }} />
        <Tabs.Screen name="company-guards" options={{ href: null }} />
        <Tabs.Screen name="admin-home" options={{ href: null }} />
        <Tabs.Screen name="admin-kyc" options={{ href: null }} />
        <Tabs.Screen name="admin-users" options={{ href: null }} />
      </Tabs>
    );
  }

  if (user.role === 'company') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.gold,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="company-home"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }: { color?: string }) => <LayoutDashboard size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen
          name="company-guards"
          options={{
            title: "Guards",
            tabBarIcon: ({ color }: { color?: string }) => <Shield size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarIcon: ({ color }: { color?: string }) => <Calendar size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }: { color?: string }) => <User size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen name="home" options={{ href: null }} />
        <Tabs.Screen name="admin-home" options={{ href: null }} />
        <Tabs.Screen name="admin-kyc" options={{ href: null }} />
        <Tabs.Screen name="admin-users" options={{ href: null }} />
      </Tabs>
    );
  }

  if (user.role === 'admin') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.gold,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="admin-home"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }: { color?: string }) => <LayoutDashboard size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen
          name="admin-kyc"
          options={{
            title: "KYC",
            tabBarIcon: ({ color }: { color?: string }) => <FileText size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen
          name="admin-users"
          options={{
            title: "Users",
            tabBarIcon: ({ color }: { color?: string }) => <UsersIcon size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarIcon: ({ color }: { color?: string }) => <Calendar size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }: { color?: string }) => <User size={24} color={color ?? Colors.textSecondary} />,
          }}
        />
        <Tabs.Screen name="home" options={{ href: null }} />
        <Tabs.Screen name="company-home" options={{ href: null }} />
        <Tabs.Screen name="company-guards" options={{ href: null }} />
      </Tabs>
    );
  }

  return <Redirect href="/auth/sign-in" />;
}
