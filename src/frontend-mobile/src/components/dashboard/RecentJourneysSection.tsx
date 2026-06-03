import { Text, View } from "react-native";
import { Link } from "expo-router";

import type { JourneyHistory, JourneyStats } from "../../core/modules/journeys/types";
import type { Vehicle } from "../../core/modules/vehicles/types";
import { JOURNEY_STATUS_LABEL, JOURNEY_STATUS_TONE } from "../../theme/journeys";
import { formatRelative } from "../../utils/format";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

type JourneyWithVehicle = JourneyHistory & { vehicle?: Vehicle };

type Props = {
  journeys: JourneyWithVehicle[];
  stats: JourneyStats;
};

export function RecentJourneysSection({ journeys, stats }: Props) {
  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-foreground">Suas jornadas</Text>
        <Link href="/(app)/map">
          <Text className="text-xs font-medium text-primary">Ir para o mapa</Text>
        </Link>
      </View>

      <View className="mb-3 flex-row gap-3">
        <Card className="flex-1 py-4">
          <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Total
          </Text>
          <Text className="mt-1 text-2xl font-semibold text-foreground">
            {stats.total}
          </Text>
        </Card>
        <Card className="flex-1 py-4">
          <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Em andamento
          </Text>
          <Text className="mt-1 text-2xl font-semibold text-foreground">
            {stats.inProgress}
          </Text>
        </Card>
        <Card className="flex-1 py-4">
          <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Km rodados
          </Text>
          <Text className="mt-1 text-2xl font-semibold text-foreground">
            {stats.totalKm.toFixed(0)}
          </Text>
        </Card>
      </View>

      {journeys.length === 0 ? (
        <Card>
          <Text className="text-sm text-muted-foreground">
            Nenhuma jornada registrada ainda. Abra o mapa, marque paradas e inicie uma
            rota.
          </Text>
          <Link href="/(app)/map" className="mt-3">
            <Text className="text-sm font-medium text-primary">Iniciar no mapa</Text>
          </Link>
        </Card>
      ) : (
        <View className="gap-y-3">
          {journeys.map((journey) => (
            <Card key={journey.id}>
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    {journey.nome ?? "Jornada sem nome"}
                  </Text>
                  {journey.vehicle ? (
                    <Text className="mt-1 font-mono text-xs text-muted-foreground">
                      {journey.vehicle.placa} · {journey.vehicle.marca}{" "}
                      {journey.vehicle.modelo}
                    </Text>
                  ) : null}
                </View>
                <Badge tone={JOURNEY_STATUS_TONE[journey.status]}>
                  {JOURNEY_STATUS_LABEL[journey.status]}
                </Badge>
              </View>
              <View className="mt-3 flex-row flex-wrap gap-x-4 gap-y-1">
                <Text className="text-xs text-muted-foreground">
                  {formatRelative(journey.iniciadaEm)}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {journey.kmRodados.toFixed(1)} km
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {journey.combustivelGasto.toFixed(1)} L
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}
