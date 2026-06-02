import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Badge } from "../../../../src/components/ui/Badge";
import { BottomSheetModal } from "../../../../src/components/ui/BottomSheetModal";
import { Card } from "../../../../src/components/ui/Card";
import { journeyModule, JourneyHistory } from "../../../../src/core/modules/journeys/journeys";
import { vehicleModule, Vehicle } from "../../../../src/core/modules/vehicles/vehicles";
import { useAuthorizedToken } from "../../../../src/hooks/useAuthorizedToken";

const journeyStatusLabel: Record<JourneyHistory["status"], string> = {
  in_progress: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
};
const journeyStatusTone: Record<
  JourneyHistory["status"],
  "primary" | "success" | "warning"
> = {
  in_progress: "primary",
  completed: "success",
  cancelled: "warning",
};

export default function VehicleJourneysScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const getToken = useAuthorizedToken();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [journeys, setJourneys] = useState<JourneyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<JourneyHistory | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const idToken = await getToken();
      const [vehicleRes, journeysRes] = await Promise.all([
        vehicleModule.gateways.get.exec({ idToken, vehicleId: id }),
        journeyModule.gateways.listVehicleJourneys.exec({ idToken, vehicleId: id }),
      ]);
      setVehicle(vehicleRes.body);
      setJourneys(journeysRes.body);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar as jornadas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#1a237e" />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-base text-foreground">
          {error ?? "Veículo não encontrado."}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Jornadas",
          headerBackTitle: vehicle.placa,
        }}
      />
      <ScrollView
        className="flex-1 bg-background"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      >
        <View className="gap-y-4 px-5 py-5">
          <Pressable
            onPress={() => router.replace(`/vehicles/${id}`)}
            className="flex-row items-center self-start rounded-full border border-border bg-card px-3 py-2"
          >
            <Ionicons name="arrow-back" size={16} color="#1a237e" />
            <Text className="ml-2 text-sm font-medium text-primary">Voltar</Text>
          </Pressable>

          <View className="gap-y-2 px-1">
            <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Jornadas
            </Text>
            <Text className="text-3xl font-semibold tracking-tight text-foreground">
              {vehicle.marca} {vehicle.modelo}
            </Text>
            <Text className="text-sm text-muted-foreground">{vehicle.placa}</Text>
          </View>

          <View className="flex-row gap-3">
            <MetricCard label="Registros" value={String(journeys.length)} />
            <MetricCard
              label="Concluídas"
              value={String(journeys.filter((item) => item.status === "completed").length)}
            />
          </View>

          <View className="gap-y-4">
            <Text className="px-1 text-base font-semibold text-foreground">
              Tabela de jornadas
            </Text>
            {error ? <Text className="px-1 text-sm text-red-500">{error}</Text> : null}
            {journeys.length === 0 ? (
              <Card>
                <Text className="text-sm text-muted-foreground">
                  Nenhuma jornada registrada para este veículo.
                </Text>
              </Card>
            ) : (
              <View className="-mx-5">
                <DataTable
                  headers={["Nome", "Status", "Início"]}
                  rows={journeys.map((journey) => ({
                    key: journey.id,
                    values: [
                      journey.nome ?? "Jornada sem nome",
                      journeyStatusLabel[journey.status],
                      new Date(journey.iniciadaEm).toLocaleDateString("pt-BR"),
                    ],
                    badge: {
                      label: `${journey.kmRodados.toFixed(1)} km`,
                      tone: journeyStatusTone[journey.status],
                    },
                    onPress: () => setSelectedJourney(journey),
                  }))}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <BottomSheetModal
        open={Boolean(selectedJourney)}
        onClose={() => setSelectedJourney(null)}
        title={selectedJourney?.nome ?? "Jornada sem nome"}
        description="Detalhes completos da jornada."
      >
        {selectedJourney ? (
          <View className="gap-y-4">
            <View className="flex-row items-center justify-between">
              <Badge tone={journeyStatusTone[selectedJourney.status]}>
                {journeyStatusLabel[selectedJourney.status]}
              </Badge>
              <Badge tone="neutral">
                {new Date(selectedJourney.iniciadaEm).toLocaleDateString("pt-BR")}
              </Badge>
            </View>
            <View className="flex-row flex-wrap gap-x-5 gap-y-4">
              <Meta label="Km rodados" value={selectedJourney.kmRodados.toFixed(1)} />
              <Meta
                label="Combustível"
                value={`${selectedJourney.combustivelGasto.toFixed(1)} L`}
              />
              <Meta
                label="Nível"
                value={`${selectedJourney.nivelCombustivel.toFixed(1)} L`}
              />
              <Meta
                label="Criado em"
                value={new Date(selectedJourney.criadaEm).toLocaleDateString("pt-BR")}
              />
              <Meta
                label="Atualizado em"
                value={new Date(selectedJourney.atualizadaEm).toLocaleDateString("pt-BR")}
              />
            </View>
          </View>
        ) : null}
      </BottomSheetModal>
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl border border-border bg-card px-4 py-3">
      <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text className="mt-1 text-lg font-semibold text-foreground">{value}</Text>
    </View>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: {
    key: string;
    values: [string, string, string];
    badge: {
      label: string;
      tone: "primary" | "success" | "warning" | "destructive" | "neutral";
    };
    onPress: () => void;
  }[];
}) {
  return (
    <View className="overflow-hidden border-y border-border bg-card">
      <View className="flex-row border-b border-border bg-muted/40 px-5 py-3">
        {headers.map((header) => (
          <Text
            key={header}
            className="flex-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            {header}
          </Text>
        ))}
      </View>
      {rows.map((row, index) => (
        <Pressable
          key={row.key}
          onPress={row.onPress}
          className={`bg-card px-5 py-3 ${
            index < rows.length - 1 ? "border-b border-border" : ""
          }`}
        >
          <View className="flex-row items-center">
            <View className="flex-1 pr-2">
              <Text className="text-sm font-medium text-foreground">{row.values[0]}</Text>
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-sm text-muted-foreground">{row.values[1]}</Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-sm text-muted-foreground">{row.values[2]}</Text>
            </View>
          </View>
          <View className="mt-3 flex-row items-center justify-between">
            <Badge tone={row.badge.tone}>{row.badge.label}</Badge>
            <View className="flex-row items-center gap-1">
              <Text className="text-xs font-medium text-primary">Ver detalhes</Text>
              <Ionicons name="chevron-forward" size={14} color="#1a237e" />
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text className="text-sm font-medium text-foreground">{value}</Text>
    </View>
  );
}
