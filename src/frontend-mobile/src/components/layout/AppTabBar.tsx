import { Pressable, View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../context/theme.context";
import { paletteFor } from "../../theme/tokens";

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
  const { theme } = useTheme();
  const palette = paletteFor(theme);

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
      <View className="flex-row items-center px-0.5">
        {visibleRoutes.map((route) => {
          const index = state.routes.findIndex((r) => r.key === route.key);
          const config = TAB_BY_ROUTE[route.name];
          if (!config) return null;

          const focused = state.index === index;
          const color = focused ? palette.tabActive : palette.tabInactive;

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
              className="min-w-0 flex-1 items-center justify-center py-2"
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={config.label}
            >
              <View
                className={`items-center justify-center rounded-lg px-2.5 py-2 ${focused ? "bg-accent" : ""}`}
              >
                <Ionicons
                  name={focused ? config.iconFocused : config.icon}
                  size={24}
                  color={color}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
