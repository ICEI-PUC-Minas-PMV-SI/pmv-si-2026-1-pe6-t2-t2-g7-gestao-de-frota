import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Badge } from "../ui/Badge";
import { BottomSheetModal } from "../ui/BottomSheetModal";
import { Card } from "../ui/Card";
import { journeyModule, JourneyHistory } from "../../core/modules/journeys/journeys";
import type { Vehicle } from "../../core/modules/vehicles/vehicles";
import { useAuthorizedToken } from "../../hooks/useAuthorizedToken";
import { getApiErrorMessage } from "../../utils/apiError";
import { useTheme } from "../../context/theme.context";
import { paletteFor } from "../../theme/tokens";

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

type Props = {
  open: boolean;
  vehicle: Vehicle;
  onClose: () => void;
};

export function VehicleJourneysSheet({ open, vehicle, onClose }: Props) {
  const getToken = useAuthorizedToken();
  const { theme } = useTheme();
  const palette = paletteFor(theme);
  const [journeys, setJourneys] = useState<JourneyHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<JourneyHistory | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await getToken();
      const journeysRes = await journeyModule.gateways.listVehicleJourneys.exec({
        idToken,
        vehicleId: vehicle.id,
      });
      setJourneys(journeysRes.body);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [getToken, vehicle.id]);

  useEffect(() => {
    if (!open) {
      setSelectedJourney(null);
      return;
    }
    void load();
  }, [open, load]);

  return (
    <>
      <BottomSheetModal
        open={open}
        onClose={onClose}
        title="Jornadas"
        description={`${vehicle.marca} ${vehicle.modelo} · ${vehicle.placa}`}
      >
        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator color={palette.spinner} />
          </View>
        ) : (
          <View className="gap-y-4 pb-4">
            <View className="flex-row gap-3">
              <MetricCard label="Registros" value={String(journeys.length)} />
              <MetricCard
                label="Concluídas"
                value={String(journeys.filter((item) => item.status === "completed").length)}
              />
            </View>

            <Text className="text-base font-semibold text-foreground">
              Tabela de jornadas
            </Text>

            {error ? <Text className="text-sm text-destructive">{error}</Text> : null}

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
                  iconColor={palette.primary}
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
        )}
      </BottomSheetModal>

      <BottomSheetModal
        open={Boolean(selectedJourney)}
        onClose={() => setSelectedJourney(null)}
        title={selectedJourney?.nome ?? "Jornada sem nome"}
        description="Detalhes completos da jornada."
      >
        {selectedJourney ? (
          <View className="gap-y-4 pb-4">
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
  iconColor,
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
  iconColor: string;
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
              <Ionicons name="chevron-forward" size={14} color={iconColor} />
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
