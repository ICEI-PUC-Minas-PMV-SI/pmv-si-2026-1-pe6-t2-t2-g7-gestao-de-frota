import { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
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
import { surfaceFor } from "../../theme/surfaceColors";
import { AnimatedBottomSheetShell } from "../ui/AnimatedBottomSheetShell";
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
}: {
  onPress: () => void;
  badge: string | null;
  primaryColor: string;
}) {
  if (Platform.OS === "web") {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label="Abrir painel de jornada"
        onClick={onPress}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPress();
          }
        }}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: FAB_Z_INDEX,
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: primaryColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(15, 23, 42, 0.35)",
          border: "none",
          outline: "none",
        }}
      >
        <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden>
          🚗
        </span>
        {badge ? (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: "#dc2626",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Abrir painel de jornada"
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: FAB_Z_INDEX,
        elevation: FAB_Z_INDEX,
      }}
      className="h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg"
    >
      <Ionicons name="car-sport" size={22} color="#ffffff" />
      {badge ? (
        <View className="absolute -right-0.5 -top-0.5 min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1">
          <Text className="text-[10px] font-bold text-white">{badge}</Text>
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
