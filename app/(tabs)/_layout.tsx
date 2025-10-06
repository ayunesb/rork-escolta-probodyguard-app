import { Tabs, Redirect } from "expo-router";
import { Shield, Calendar, User, Briefcase, Settings, LayoutDashboard, Users as UsersIcon } from "lucide-react-native";
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocationTracking } from "@/contexts/LocationTrackingContext";
import Colors from "@/constants/colors";

export default function TabLayout() {
  const { user } = useAuth();
  const { setRole } = useLocationTracking();

  useEffect(() => {
    if (user) {
      setRole(user.role);
    }
  }, [user, setRole]);

  if (!user) {
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
            tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
          }}
        />
        <Tabs.Screen name="company-home" options={{ href: null }} />
        <Tabs.Screen name="admin-home" options={{ href: null }} />
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
            tabBarIcon: ({ color }) => <Briefcase size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "History",
            tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
          }}
        />
        <Tabs.Screen name="company-home" options={{ href: null }} />
        <Tabs.Screen name="admin-home" options={{ href: null }} />
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
            tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
          }}
        />
        <Tabs.Screen name="home" options={{ href: null }} />
        <Tabs.Screen name="admin-home" options={{ href: null }} />
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
            tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
          }}
        />
        <Tabs.Screen name="home" options={{ href: null }} />
        <Tabs.Screen name="company-home" options={{ href: null }} />
      </Tabs>
    );
  }

  return <Redirect href="/auth/sign-in" />;
}
