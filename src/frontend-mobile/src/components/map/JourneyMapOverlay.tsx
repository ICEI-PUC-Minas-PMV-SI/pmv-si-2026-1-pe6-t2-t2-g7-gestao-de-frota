import { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../context/theme.context";
import type { RoutePreviewStatus } from "../../hooks/useMapJourney";
import type { Vehicle } from "../../core/modules/vehicles/vehicles";
import { surfaceFor } from "../../theme/surfaceColors";
import { AnimatedBottomSheetShell } from "../ui/AnimatedBottomSheetShell";
import { JourneyMapFabVisual } from "./VehicleMapMarker";
import { JourneyMapControls } from "./JourneyMapControls";

/** Acima das camadas do Leaflet (tiles ~200–400). */
const FAB_Z_INDEX = 1000;
const SHEET_MAX_HEIGHT = Math.min(Dimensions.get("window").height * 0.72, 520);

type Props = {
  journeyId: string | null;
  busy: boolean;
  plannedStopsCount: number;
  routePreviewStatus: RoutePreviewStatus;
  canStartJourney: boolean;
  hasGps: boolean;
  geoHint: string | null;
  positionError: string | null;
  vehicles: Vehicle[];
  vehicleId: string | null;
  loadingVehicles: boolean;
  onVehicleChange: (vehicleId: string) => void;
  onStart: () => void;
  onStop: () => void;
  onAddCurrentLocation: () => void;
  onUndoPlannedStop: () => void;
  onClearPlannedStops: () => void;
};

function JourneyFabButton({
  onPress,
  badge,
  primaryColor,
  ringColor,
  surfaceColor,
  active,
  subtitle,
}: {
  onPress: () => void;
  badge: string | null;
  primaryColor: string;
  ringColor: string;
  surfaceColor: string;
  active: boolean;
  subtitle: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Abrir painel de jornada"
      style={({ pressed }) => [
        fabStyles.host,
        { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <JourneyMapFabVisual
        color={primaryColor}
        ringColor={ringColor}
        surfaceColor={surfaceColor}
        active={active}
        subtitle={subtitle}
      />
      {badge ? (
        <View style={fabStyles.badge}>
          <Text style={fabStyles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function JourneyMapOverlay({
  journeyId,
  plannedStopsCount,
  ...controls
}: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = surfaceFor(theme);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (journeyId) setOpen(true);
  }, [journeyId]);

  const badge =
    journeyId != null
      ? "!"
      : plannedStopsCount > 0
        ? String(plannedStopsCount)
        : null;

  const fabSubtitle =
    journeyId != null
      ? "Em andamento"
      : plannedStopsCount > 0
        ? `${plannedStopsCount} parada${plannedStopsCount > 1 ? "s" : ""}`
        : "Planejar rota";

  const sheetPaddingBottom = Math.max(insets.bottom, 16);

  return (
    <>
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: FAB_Z_INDEX,
          elevation: FAB_Z_INDEX,
        }}
      >
        <JourneyFabButton
          onPress={() => setOpen(true)}
          badge={badge}
          primaryColor={colors.primary}
          ringColor={theme === "light" ? "#e2e8f0" : "rgba(255,255,255,0.16)"}
          surfaceColor={colors.card}
          active={Boolean(journeyId)}
          subtitle={fabSubtitle}
        />
      </View>

      <AnimatedBottomSheetShell open={open} onClose={() => setOpen(false)}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              maxHeight: SHEET_MAX_HEIGHT + sheetPaddingBottom,
              paddingBottom: sheetPaddingBottom,
            },
          ]}
        >
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.title, { color: colors.foreground }]}>
                Jornada
              </Text>
              {journeyId ? (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.successBg },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: colors.success }]}>
                    Em andamento
                  </Text>
                </View>
              ) : plannedStopsCount > 0 ? (
                <View
                  style={[styles.badge, { backgroundColor: colors.accent }]}
                >
                  <Text style={[styles.badgeText, { color: colors.primary }]}>
                    {plannedStopsCount} parada
                    {plannedStopsCount > 1 ? "s" : ""}
                  </Text>
                </View>
              ) : null}
            </View>
            <Pressable
              onPress={() => setOpen(false)}
              hitSlop={12}
              accessibilityLabel="Fechar"
              style={[styles.closeBtn, { borderColor: colors.border }]}
            >
              <Ionicons name="close" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <JourneyMapControls
              journeyId={journeyId}
              plannedStopsCount={plannedStopsCount}
              {...controls}
            />
          </ScrollView>
        </View>
      </AnimatedBottomSheetShell>
    </>
  );
}

const fabStyles = StyleSheet.create({
  host: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: FAB_Z_INDEX,
    elevation: FAB_Z_INDEX,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#dc2626",
    borderWidth: 2,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
});

const styles = StyleSheet.create({
  sheet: {
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  closeBtn: {
    marginLeft: 8,
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  scroll: {
    maxHeight: SHEET_MAX_HEIGHT - 72,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
});
