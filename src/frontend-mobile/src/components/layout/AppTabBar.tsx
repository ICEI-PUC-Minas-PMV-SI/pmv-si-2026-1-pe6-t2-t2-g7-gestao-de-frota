import { Pressable, Text, View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../theme/tokens";

type TabConfig = {
  routeName: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

/** Ordem alinhada ao AppSidebar do web. */
export const APP_TABS: TabConfig[] = [
  { routeName: "homepage", label: "Início", icon: "home-outline", iconFocused: "home" },
  {
    routeName: "dashboard",
    label: "Painel",
    icon: "grid-outline",
    iconFocused: "grid",
  },
  { routeName: "map", label: "Mapa", icon: "map-outline", iconFocused: "map" },
  {
    routeName: "vehicles",
    label: "Frota",
    icon: "car-outline",
    iconFocused: "car",
  },
  {
    routeName: "incidents",
    label: "Incidentes",
    icon: "warning-outline",
    iconFocused: "warning",
  },
  {
    routeName: "account",
    label: "Conta",
    icon: "person-outline",
    iconFocused: "person",
  },
];

const TAB_BY_ROUTE = Object.fromEntries(
  APP_TABS.map((t) => [t.routeName, t]),
) as Record<string, TabConfig>;

export function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter((r) => TAB_BY_ROUTE[r.name]);

  return (
    <View
      className="border-t border-border bg-card"
      style={{
        paddingBottom: Math.max(insets.bottom, 6),
        paddingTop: 6,
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View className="flex-row items-stretch px-0.5">
        {visibleRoutes.map((route) => {
          const index = state.routes.findIndex((r) => r.key === route.key);
          const config = TAB_BY_ROUTE[route.name];
          if (!config) return null;

          const focused = state.index === index;
          const color = focused ? colors.primary : colors.tabInactive;

          return (
            <Pressable
              key={route.key}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              className="min-w-0 flex-1 items-center justify-center py-1"
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={config.label}
            >
              <View
                className={`mb-0.5 items-center justify-center rounded-lg px-2 py-1 ${focused ? "bg-accent" : ""}`}
              >
                <Ionicons
                  name={focused ? config.iconFocused : config.icon}
                  size={focused ? 21 : 20}
                  color={color}
                />
              </View>
              <Text
                numberOfLines={1}
                className={`max-w-full px-0.5 text-center text-[9px] font-medium leading-tight ${
                  focused ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
