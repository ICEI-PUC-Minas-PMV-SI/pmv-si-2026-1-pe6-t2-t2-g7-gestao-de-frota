import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { JourneyMapControls } from "./JourneyMapControls";
import type { RoutePreviewStatus } from "../../hooks/useMapJourney";

/** Acima das camadas do Leaflet (tiles ~200–400). */
const FAB_Z_INDEX = 1000;

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
}: {
  onPress: () => void;
  badge: string | null;
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
          backgroundColor: "#1a237e",
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
        <JourneyFabButton onPress={() => setOpen(true)} badge={badge} />
      </View>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/45"
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="max-h-[85%] rounded-t-2xl bg-background"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <View className="items-center py-2">
              <View className="h-1 w-10 rounded-full bg-border" />
            </View>
            <View className="flex-row items-center justify-between px-5 pb-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-semibold text-foreground">
                  Jornada
                </Text>
                {journeyId ? (
                  <View className="rounded-full bg-[#dcfce7] px-2 py-0.5">
                    <Text className="text-[10px] font-medium text-[#16a34a]">
                      Em andamento
                    </Text>
                  </View>
                ) : plannedStopsCount > 0 ? (
                  <View className="rounded-full bg-accent px-2 py-0.5">
                    <Text className="text-[10px] font-medium text-primary">
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
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </Pressable>
            </View>
            <ScrollView
              className="px-5"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <JourneyMapControls
                journeyId={journeyId}
                plannedStopsCount={plannedStopsCount}
                {...controls}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
