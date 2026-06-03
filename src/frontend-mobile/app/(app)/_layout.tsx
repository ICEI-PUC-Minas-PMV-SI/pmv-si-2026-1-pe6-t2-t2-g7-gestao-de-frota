import { ActivityIndicator, View } from "react-native";
import { Redirect, Tabs } from "expo-router";

import { HighlightedTabBar } from "../../src/components/layout/HighlightedTabBar";
import { useAuth } from "../../src/context/auth.context";
import { useTheme } from "../../src/context/theme.context";
import { paletteFor } from "../../src/theme/tokens";

export default function AppLayout() {
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
      tabBar={(props) => <HighlightedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: palette.sceneBg,
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          shadowColor: "transparent",
        },
        tabBarBackground: () => null,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Painel" }} />
      <Tabs.Screen name="vehicles" options={{ title: "Meus veículos" }} />
      <Tabs.Screen name="map" options={{ title: "Mapa" }} />
      <Tabs.Screen name="incidents" options={{ title: "Incidentes" }} />
      <Tabs.Screen name="account" options={{ title: "Conta" }} />
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
