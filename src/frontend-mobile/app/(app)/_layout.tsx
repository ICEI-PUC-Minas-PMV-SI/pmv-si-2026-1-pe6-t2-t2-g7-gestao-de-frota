import { Tabs } from "expo-router";

import { AuthGate } from "../../src/components/auth/AuthGate";
import { AppTabBar } from "../../src/components/layout/AppTabBar";

export default function AppLayout() {
  return (
    <AuthGate mode="auth">
      <Tabs
        tabBar={(props) => <AppTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="homepage" />
        <Tabs.Screen name="dashboard" />
        <Tabs.Screen name="map" />
        <Tabs.Screen name="vehicles" />
        <Tabs.Screen name="incidents" />
        <Tabs.Screen name="account" />
      </Tabs>
    </AuthGate>
  );
}
