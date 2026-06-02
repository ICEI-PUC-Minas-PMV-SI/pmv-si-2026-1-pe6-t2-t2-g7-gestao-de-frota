import { ActivityIndicator, View } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../src/context/auth.context";

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#1a237e" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#1a237e",
        tabBarInactiveTintColor: "#94a3b8",
        headerStyle: {
          backgroundColor: "#f8fafc",
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: "#1e293b",
          fontWeight: "700",
        },
        sceneStyle: {
          backgroundColor: "#f8fafc",
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#cbd5e1",
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="vehicles"
        options={{
          title: "Meus veículos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-sport-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: "Membros",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Conta",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="homepage"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="incidents"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="vehicle/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="vehicles/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="vehicle/[id]/incidents"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="vehicle/[id]/journeys"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
