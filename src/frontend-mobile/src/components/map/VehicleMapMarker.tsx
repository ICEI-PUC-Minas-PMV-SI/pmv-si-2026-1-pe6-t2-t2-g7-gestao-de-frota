import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, Path } from "react-native-svg";

import { useTheme } from "../../context/theme.context";
import { paletteFor } from "../../theme/tokens";

export const MAP_FAB_HEIGHT = 52;

type FabProps = {
  color: string;
  ringColor: string;
  surfaceColor: string;
  active?: boolean;
  subtitle?: string;
};

/** Botão flutuante do painel de jornada (canto superior do mapa). */
export function JourneyMapFabVisual({
  color,
  ringColor,
  surfaceColor,
  active,
  subtitle = "Planejar rota",
}: FabProps) {
  const accent = active ? "#16a34a" : color;

  return (
    <View style={styles.fabHost}>
      <View style={[styles.fabGlow, { backgroundColor: `${accent}28` }]} />
      <View
        style={[
          styles.fabPill,
          {
            backgroundColor: surfaceColor,
            borderColor: ringColor,
            shadowColor: accent,
          },
        ]}
      >
        <View style={[styles.fabIconOrbit, { borderColor: `${accent}30` }]}>
          <View style={[styles.fabIconCore, { backgroundColor: accent }]}>
            <Ionicons name={active ? "radio-button-on" : "navigate"} size={17} color="#ffffff" />
          </View>
          <View style={[styles.fabRouteDot, styles.fabRouteDotA, { backgroundColor: accent }]} />
          <View style={[styles.fabRouteDot, styles.fabRouteDotB, { backgroundColor: accent }]} />
        </View>

        <View style={styles.fabCopy}>
          <Text style={[styles.fabTitle, { color: accent }]}>Jornada</Text>
          <Text style={styles.fabSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        <View style={[styles.fabChevron, { backgroundColor: `${accent}12` }]}>
          <Ionicons name="chevron-up" size={15} color={accent} />
        </View>
      </View>
    </View>
  );
}

/** Marcador da posição do veículo no mapa (pin com halo). */
export function MapVehicleMarker() {
  const { theme } = useTheme();
  const color = paletteFor(theme).tabActive;
  const ring = theme === "light" ? "#ffffff" : "rgba(255,255,255,0.85)";

  return (
    <View style={styles.markerHost}>
      <View style={[styles.markerPulse, { borderColor: `${color}55` }]} />
      <View style={[styles.markerPulseInner, { backgroundColor: `${color}18` }]} />
      <Svg width={38} height={48} viewBox="0 0 38 48">
        <Path
          d="M19 1.5C11.4 1.5 5 7.55 5 14.8c0 9.8 14 31.2 14 31.2s14-21.4 14-31.2C33 7.55 26.6 1.5 19 1.5z"
          fill={color}
          stroke={ring}
          strokeWidth={2.2}
        />
        <Circle cx={19} cy={15} r={9.5} fill="rgba(255,255,255,0.18)" />
      </Svg>
      <View style={styles.markerIconWrap}>
        <Ionicons name="car-sport" size={15} color="#ffffff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fabHost: {
    alignItems: "center",
    justifyContent: "center",
  },
  fabGlow: {
    position: "absolute",
    width: 120,
    height: 56,
    borderRadius: 28,
  },
  fabPill: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: MAP_FAB_HEIGHT,
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    gap: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 12,
  },
  fabIconOrbit: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  fabIconCore: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  fabRouteDot: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    opacity: 0.85,
  },
  fabRouteDotA: {
    top: 4,
    right: 6,
  },
  fabRouteDotB: {
    bottom: 5,
    left: 5,
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.55,
  },
  fabCopy: {
    minWidth: 72,
    maxWidth: 110,
    paddingRight: 2,
  },
  fabTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  fabSubtitle: {
    marginTop: 1,
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
  },
  fabChevron: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  markerHost: {
    width: 48,
    height: 56,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  markerPulse: {
    position: "absolute",
    bottom: 4,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
  },
  markerPulseInner: {
    position: "absolute",
    bottom: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  markerIconWrap: {
    position: "absolute",
    top: 10,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
