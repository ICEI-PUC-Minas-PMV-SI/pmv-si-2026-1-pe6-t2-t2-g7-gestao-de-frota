import { useEffect, useMemo, useContext } from "react";
import { Dimensions, LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import {
  BottomTabBarHeightCallbackContext,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../context/theme.context";
import { paletteFor } from "../../theme/tokens";

const AnimatedPath = Animated.createAnimatedComponent(Path);

type TabConfig = {
  routeName: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

export const HIGHLIGHTED_TABS: TabConfig[] = [
  {
    routeName: "dashboard",
    label: "Painel",
    icon: "grid-outline",
    iconFocused: "grid",
  },
  {
    routeName: "vehicles",
    label: "Frota",
    icon: "car-outline",
    iconFocused: "car",
  },
  {
    routeName: "map",
    label: "Mapa",
    icon: "map-outline",
    iconFocused: "map",
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
  HIGHLIGHTED_TABS.map((tab) => [tab.routeName, tab]),
) as Record<string, TabConfig>;

/** Rotas ocultas nas tabs mantêm o destaque da aba pai. */
const PARENT_TAB_BY_ROUTE: Record<string, string> = {
  "vehicle/[id]": "vehicles",
  "vehicles/[id]": "vehicles",
  "vehicle/[id]/incidents": "vehicles",
  "vehicle/[id]/journeys": "vehicles",
  homepage: "dashboard",
};

const BUBBLE_RADIUS = 18;
const BUBBLE_SIZE = BUBBLE_RADIUS * 2;
const BUBBLE_PROTRUSION = 14;
const BAR_RIM_Y = BUBBLE_PROTRUSION + 12;
/** Menor = bolha mais dentro da cratera. */
const BUBBLE_LIFT = 5;
const NOTCH_DEPTH = 26;
const NOTCH_DIP_Y = BAR_RIM_Y + NOTCH_DEPTH;
/** Maior = cratera mais larga horizontalmente. */
const NOTCH_HALF = BUBBLE_RADIUS + 18;
const BAR_BODY = 16;
const BAR_CORNER = 18;
const BAR_HORIZONTAL_MARGIN = 16;
const FLOAT_BOTTOM_GAP = 10;
const ICON_SIZE = 18;

const SPRING = {
  damping: 17,
  stiffness: 220,
  mass: 0.78,
};

const BUBBLE_CY = BAR_RIM_Y - BUBBLE_LIFT;

const NOTCH_SHOULDER_HANDLE = 0.56;
const NOTCH_CENTER_HANDLE = 0.44;
const NOTCH_EDGE_MARGIN = 3;

/** Menor recuo lateral que ainda cabe a cratera completa nas abas das pontas. */
function computeTabCenterInset(barWidth: number, tabCount: number): number {
  "worklet";

  if (tabCount <= 1) {
    return 0;
  }

  const n = tabCount;
  const margin = NOTCH_EDGE_MARGIN;
  const minFromLeft = BAR_CORNER + margin + NOTCH_HALF;
  const minFromRight = barWidth - BAR_CORNER - margin - NOTCH_HALF;

  const insetForFirst =
    (minFromLeft - barWidth / (2 * n)) / (1 - 1 / n);
  const insetForLast =
    (((n - 0.5) * barWidth) / n - minFromRight) / ((n - 1) / n);

  return Math.max(0, Math.ceil(Math.max(insetForFirst, insetForLast)));
}

function tabCenterX(index: number, tabCount: number, barWidth: number): number {
  "worklet";

  const inset = computeTabCenterInset(barWidth, tabCount);
  const usable = barWidth - inset * 2;
  const section = usable / tabCount;
  return inset + (index + 0.5) * section;
}

function buildCurvedTabBarPath(
  width: number,
  height: number,
  centerX: number,
): string {
  "worklet";

  const cx = centerX;
  const rim = BAR_RIM_Y;
  const dip = NOTCH_DIP_Y;
  const corner = BAR_CORNER;
  const half = NOTCH_HALF;
  const left = cx - half;
  const right = cx + half;
  const shoulder = half * NOTCH_SHOULDER_HANDLE;
  const center = half * NOTCH_CENTER_HANDLE;

  const parts = [`M ${corner} ${rim}`];

  if (left > corner + 0.5) {
    parts.push(`H ${left}`);
  }

  parts.push(
    `C ${left + shoulder} ${rim} ${cx - center} ${dip} ${cx} ${dip}`,
    `C ${cx + center} ${dip} ${right - shoulder} ${rim} ${right} ${rim}`,
  );

  if (right < width - corner - 0.5) {
    parts.push(`H ${width - corner}`);
  }

  parts.push(
    `Q ${width} ${rim} ${width} ${rim + corner}`,
    `V ${height - corner}`,
    `Q ${width} ${height} ${width - corner} ${height}`,
    `H ${corner}`,
    `Q 0 ${height} 0 ${height - corner}`,
    `V ${rim + corner}`,
    `Q 0 ${rim} ${corner} ${rim}`,
    "Z",
  );

  return parts.join(" ");
}

export function HighlightedTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const { theme } = useTheme();
  const palette = paletteFor(theme);
  const screenWidth = Dimensions.get("window").width;
  const barWidth = screenWidth - BAR_HORIZONTAL_MARGIN * 2;
  const floatBottom = Math.max(insets.bottom, 8) + FLOAT_BOTTOM_GAP;
  const svgHeight = NOTCH_DIP_Y + BAR_BODY + 6;

  const visibleRoutes = state.routes.filter((route) => TAB_BY_ROUTE[route.name]);
  const tabCount = visibleRoutes.length || 1;

  const focusedRouteIndex = useMemo(() => {
    const activeRoute = state.routes[state.index];
    if (!activeRoute) return 0;

    const parentName = PARENT_TAB_BY_ROUTE[activeRoute.name] ?? activeRoute.name;
    const visibleIndex = visibleRoutes.findIndex((route) => route.name === parentName);
    return visibleIndex >= 0 ? visibleIndex : 0;
  }, [state.index, state.routes, visibleRoutes]);

  const tabCenterInset = useMemo(
    () => computeTabCenterInset(barWidth, tabCount),
    [barWidth, tabCount],
  );

  const focusedConfig =
    TAB_BY_ROUTE[visibleRoutes[focusedRouteIndex]?.name ?? ""];

  const centerX = useSharedValue(
    tabCenterX(focusedRouteIndex, tabCount, barWidth),
  );

  useEffect(() => {
    centerX.value = withSpring(
      tabCenterX(focusedRouteIndex, tabCount, barWidth),
      SPRING,
    );
  }, [centerX, focusedRouteIndex, tabCount, barWidth]);

  const animatedPathProps = useAnimatedProps(() => ({
    d: buildCurvedTabBarPath(barWidth, svgHeight, centerX.value),
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: centerX.value - BUBBLE_SIZE / 2 }],
  }));

  const bubbleTop = BUBBLE_CY - BUBBLE_RADIUS;
  const svgTop = Math.max(0, -bubbleTop);
  const tabRowTop =
    svgTop + BAR_RIM_Y + (svgHeight - BAR_RIM_Y - ICON_SIZE) / 2;

  const handleLayout = (event: LayoutChangeEvent) => {
    onHeightChange?.(event.nativeEvent.layout.height);
  };

  return (
    <View
      style={styles.absoluteHost}
      onLayout={handleLayout}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.floatHost,
          {
            paddingBottom: floatBottom,
            paddingHorizontal: BAR_HORIZONTAL_MARGIN,
          },
        ]}
        pointerEvents="box-none"
      >
      <View
        style={[
          styles.barShell,
          {
            height: svgHeight + svgTop + 2,
            paddingTop: svgTop,
          },
        ]}
        pointerEvents="box-none"
      >
        <Svg
          width={barWidth}
          height={svgHeight}
          style={[styles.barSvg, { top: svgTop }]}
          pointerEvents="none"
        >
          <AnimatedPath
            animatedProps={animatedPathProps}
            fill={palette.tabBar}
            stroke={palette.tabBarBorder}
            strokeWidth={theme === "light" ? 1.5 : 1}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>

        <Animated.View
          style={[
            styles.bubble,
            bubbleStyle,
            {
              top: bubbleTop,
              backgroundColor: palette.tabActive,
              shadowColor: palette.tabActive,
              borderColor: theme === "light" ? "#ffffff" : "rgba(255,255,255,0.2)",
            },
          ]}
        >
          {focusedConfig ? (
            <Ionicons
              name={focusedConfig.iconFocused}
              size={ICON_SIZE}
              color="#ffffff"
            />
          ) : null}
        </Animated.View>

        <View
          style={[
            styles.tabsRow,
            {
              width: barWidth,
              top: tabRowTop,
              height: ICON_SIZE,
              paddingHorizontal: tabCenterInset,
            },
          ]}
        >
          {visibleRoutes.map((route) => {
            const routeIndex = state.routes.findIndex(
              (item) => item.key === route.key,
            );
            const config = TAB_BY_ROUTE[route.name];
            if (!config) return null;

            const focused = state.index === routeIndex;

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
                style={styles.tab}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={config.label}
              >
                {!focused ? (
                  <Ionicons
                    name={config.icon}
                    size={ICON_SIZE}
                    color={palette.tabInactive}
                  />
                ) : (
                  <View style={styles.activeTabSpacer} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteHost: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  floatHost: {
    overflow: "visible",
    backgroundColor: "transparent",
  },
  barShell: {
    overflow: "visible",
    backgroundColor: "transparent",
  },
  barSvg: {
    position: "absolute",
    left: 0,
  },
  bubble: {
    position: "absolute",
    left: 0,
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 3,
  },
  tabsRow: {
    position: "absolute",
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: ICON_SIZE,
  },
  activeTabSpacer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
});
