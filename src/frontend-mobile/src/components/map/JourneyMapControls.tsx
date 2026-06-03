import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../context/theme.context";
import type { RoutePreviewStatus } from "../../hooks/useMapJourney";
import { surfaceFor } from "../../theme/surfaceColors";
import { Button } from "../ui/Button";

const ROUTE_STATUS_LABEL: Record<RoutePreviewStatus, string> = {
  idle: "Marque 2+ paradas para calcular rota",
  loading: "Calculando rota (OSRM)...",
  ok: "Rota OSRM pronta",
  fallback: "OSRM indisponível — linha direta",
};

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

export function JourneyMapControls({
  journeyId,
  busy,
  plannedStopsCount,
  routePreviewStatus,
  canStartJourney,
  hasGps,
  geoHint,
  positionError,
  onStart,
  onStop,
  onAddCurrentLocation,
  onUndoPlannedStop,
  onClearPlannedStops,
}: Props) {
  const { theme } = useTheme();
  const colors = surfaceFor(theme);

  return (
    <View style={styles.root}>
      {!journeyId ? (
        <Text style={[styles.muted, { color: colors.mutedForeground }]}>
          {ROUTE_STATUS_LABEL[routePreviewStatus]}
        </Text>
      ) : null}

      {geoHint ? (
        <Text style={[styles.hint, { color: colors.primary }]}>{geoHint}</Text>
      ) : null}
      {positionError ? (
        <Text style={[styles.error, { color: colors.destructive }]}>
          {positionError}
        </Text>
      ) : null}

      {!journeyId ? (
        <>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            Toque no mapa para marcar paradas (mín. 2). A rota segue as ruas via
            OSRM.
          </Text>
          <Text style={[styles.label, { color: colors.foreground }]}>
            Paradas: {plannedStopsCount}
          </Text>
          <View style={styles.actionRow}>
            <View style={styles.actionCell}>
              <Button
                variant="outline"
                className="w-full"
                onPress={onAddCurrentLocation}
                disabled={!hasGps || busy}
              >
                Minha posição
              </Button>
            </View>
            <View style={styles.actionCell}>
              <TonedActionButton
                label="Desfazer"
                icon="arrow-undo"
                tone="undo"
                onPress={onUndoPlannedStop}
                disabled={plannedStopsCount === 0 || busy}
              />
            </View>
            <View style={styles.actionCell}>
              <TonedActionButton
                label="Limpar"
                icon="trash-outline"
                tone="clear"
                onPress={onClearPlannedStops}
                disabled={plannedStopsCount === 0 || busy}
              />
            </View>
          </View>
          <Button
            className="w-full"
            onPress={onStart}
            loading={busy}
            disabled={!canStartJourney || routePreviewStatus === "loading"}
          >
            Iniciar jornada
          </Button>
        </>
      ) : (
        <Button className="w-full" variant="destructive" onPress={onStop} loading={busy}>
          Encerrar jornada
        </Button>
      )}
    </View>
  );
}

type TonedActionButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: "undo" | "clear";
  onPress: () => void;
  disabled?: boolean;
};

function TonedActionButton({
  label,
  icon,
  tone,
  onPress,
  disabled,
}: TonedActionButtonProps) {
  const isUndo = tone === "undo";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.tonedBtn,
        isUndo ? styles.undoBtn : styles.clearBtn,
        disabled ? styles.tonedBtnDisabled : null,
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={isUndo ? "#a16207" : "#b91c1c"}
      />
      <Text style={[styles.tonedBtnText, isUndo ? styles.undoText : styles.clearText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    gap: 12,
    paddingBottom: 8,
  },
  muted: {
    fontSize: 12,
    lineHeight: 18,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
  },
  error: {
    fontSize: 12,
    lineHeight: 18,
  },
  body: {
    fontSize: 12,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
  },
  actionCell: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: "30%",
  },
  tonedBtn: {
    minHeight: 48,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  undoBtn: {
    backgroundColor: "#fef9c3",
    borderColor: "#fde68a",
  },
  clearBtn: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  tonedBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  undoText: {
    color: "#a16207",
  },
  clearText: {
    color: "#b91c1c",
  },
  tonedBtnDisabled: {
    opacity: 0.5,
  },
});
