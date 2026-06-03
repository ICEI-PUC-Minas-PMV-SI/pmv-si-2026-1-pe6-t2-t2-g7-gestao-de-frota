import { ActivityIndicator, View } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabBarIcon } from "../../src/components/layout/TabBarIcon";
import { useAuth } from "../../src/context/auth.context";
import { useTheme } from "../../src/context/theme.context";
import { paletteFor } from "../../src/theme/tokens";

const TAB_BAR_CONTENT_HEIGHT = 52;

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const palette = paletteFor(theme);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={palette.spinner} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.tabActive,
        tabBarInactiveTintColor: palette.tabInactive,
        headerStyle: {
          backgroundColor: palette.headerBg,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: palette.headerTitle,
          fontWeight: "700",
        },
        sceneStyle: {
          backgroundColor: palette.sceneBg,
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: palette.tabBar,
          borderTopColor: palette.tabBarBorder,
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 4,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Painel",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="grid-outline"
              nameFocused="grid"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: "Meus veículos",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="car-outline"
              nameFocused="car"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="map-outline"
              nameFocused="map"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="incidents"
        options={{
          title: "Incidentes",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="warning-outline"
              nameFocused="warning"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Conta",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="person-outline"
              nameFocused="person"
              color={color}
              focused={focused}
            />
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
