import { Text, View } from "react-native";
import { Link } from "expo-router";

import type { JourneyHistory, JourneyStats } from "../../core/modules/journeys/types";
import type { Vehicle } from "../../core/modules/vehicles/types";
import { JOURNEY_STATUS_LABEL, JOURNEY_STATUS_TONE } from "../../theme/journeys";
import { formatRelative } from "../../utils/format";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

type JourneyWithVehicle = JourneyHistory & { vehicle?: Vehicle };

const RECENT_JOURNEYS_LIMIT = 3;

type Props = {
  journeys: JourneyWithVehicle[];
  stats: JourneyStats;
};

function JourneyStatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <Card className={`px-4 py-4 ${className ?? ""}`}>
      <Text
        className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
        numberOfLines={2}
      >
        {label}
      </Text>
      <Text
        className="mt-1 text-2xl font-semibold text-foreground"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {value}
      </Text>
    </Card>
  );
}

export function RecentJourneysSection({ journeys, stats }: Props) {
  const hasMore = stats.total > RECENT_JOURNEYS_LIMIT;
  const kmLabel = stats.totalKm.toFixed(0);

  return (
    <View>
      <View className="mb-3 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-semibold text-foreground">
            Suas últimas 3 jornadas
          </Text>
          {hasMore ? (
            <Text className="mt-1 text-xs text-muted-foreground">
              {stats.total} jornadas no total
            </Text>
          ) : null}
        </View>
        <Link href="/(app)/map" className="shrink-0">
          <Text className="text-xs font-medium text-primary">
            {hasMore ? "Ver todas no mapa" : "Ir para o mapa"}
          </Text>
        </Link>
      </View>

      <View className="mb-3 gap-3">
        <View className="flex-row justify-between gap-3">
          <JourneyStatCard label="Total" value={stats.total} className="w-[48%]" />
          <JourneyStatCard
            label="Em andamento"
            value={stats.inProgress}
            className="w-[48%]"
          />
        </View>
        <Card className="flex-row items-center justify-between gap-4 px-4 py-4">
          <Text className="shrink text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Km rodados
          </Text>
          <Text
            className="text-2xl font-semibold text-foreground"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {kmLabel}
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
