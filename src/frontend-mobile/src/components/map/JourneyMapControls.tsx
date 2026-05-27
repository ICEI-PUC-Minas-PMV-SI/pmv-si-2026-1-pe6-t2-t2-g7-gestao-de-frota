import { Text, View } from "react-native";

import type { RoutePreviewStatus } from "../../hooks/useMapJourney";
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
  return (
    <View className="gap-y-3 pb-4">
      {!journeyId ? (
        <Text className="text-xs text-muted-foreground">
          {ROUTE_STATUS_LABEL[routePreviewStatus]}
        </Text>
      ) : null}

      {geoHint ? (
        <Text className="text-xs leading-5 text-primary">{geoHint}</Text>
      ) : null}
      {positionError ? (
        <Text className="text-xs text-destructive">{positionError}</Text>
      ) : null}

      {!journeyId ? (
        <>
          <Text className="text-xs leading-5 text-muted-foreground">
            Toque no mapa para marcar paradas (mín. 2). A rota segue as ruas via
            OSRM, como no frontend web.
          </Text>
          <Text className="text-xs font-medium text-foreground">
            Paradas: {plannedStopsCount}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Button
              variant="outline"
              onPress={onAddCurrentLocation}
              disabled={!hasGps || busy}
            >
              Minha posição
            </Button>
            <Button
              variant="outline"
              onPress={onUndoPlannedStop}
              disabled={plannedStopsCount === 0 || busy}
            >
              Desfazer
            </Button>
            <Button
              variant="outline"
              onPress={onClearPlannedStops}
              disabled={plannedStopsCount === 0 || busy}
            >
              Limpar
            </Button>
          </View>
          <Button
            onPress={onStart}
            loading={busy}
            disabled={!canStartJourney || routePreviewStatus === "loading"}
          >
            Iniciar jornada
          </Button>
        </>
      ) : (
        <Button variant="destructive" onPress={onStop} loading={busy}>
          Encerrar jornada
        </Button>
      )}
    </View>
  );
}
