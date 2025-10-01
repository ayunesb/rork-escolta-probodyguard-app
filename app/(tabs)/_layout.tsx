import { Tabs, Redirect } from "expo-router";
import { Shield, Calendar, User, Briefcase, Settings, Building2, UserCog } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";

export default function TabLayout() {
  const { user } = useAuth();

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
          name="home"
          options={{
            title: "Roster",
            tabBarIcon: ({ color }) => <Building2 size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Jobs",
            tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
          }}
        />
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
          name="home"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => <UserCog size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "KYC",
            tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
          }}
        />
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
      </Tabs>
    );
  }

  return <Redirect href="/auth/sign-in" />;
}
