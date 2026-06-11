import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { BottomSheetModal } from "../ui/BottomSheetModal";
import { Card } from "../ui/Card";
import { journeyModule, JourneyHistory } from "../../core/modules/journeys/journeys";
import { incidentModule, Incident } from "../../core/modules/incidents/incidents";
import { vehicleModule, Vehicle } from "../../core/modules/vehicles/vehicles";
import { useAuthorizedToken } from "../../hooks/useAuthorizedToken";
import { getApiErrorMessage } from "../../utils/apiError";
import { useTheme } from "../../context/theme.context";
import { paletteFor } from "../../theme/tokens";
import { VehicleIncidentsSheet } from "./VehicleIncidentsSheet";
import { VehicleJourneysSheet } from "./VehicleJourneysSheet";

type SubView = "incidents" | "journeys";

type Props = {
  open: boolean;
  vehicle: Vehicle | null;
  initialSubView?: SubView | null;
  onClose: () => void;
};

export function VehicleDetailSheet({
  open,
  vehicle,
  initialSubView,
  onClose,
}: Props) {
  const getToken = useAuthorizedToken();
  const { theme } = useTheme();
  const palette = paletteFor(theme);
  const [detail, setDetail] = useState<Vehicle | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [journeys, setJourneys] = useState<JourneyHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incidentsOpen, setIncidentsOpen] = useState(false);
  const [journeysOpen, setJourneysOpen] = useState(false);

  const load = useCallback(async () => {
    if (!vehicle) return;
    setLoading(true);
    setError(null);
    try {
      const idToken = await getToken();
      const [vehicleRes, incidentsRes, journeysRes] = await Promise.all([
        vehicleModule.gateways.get.exec({ idToken, vehicleId: vehicle.id }),
        incidentModule.gateways.listByVehicle.exec({ idToken, vehicleId: vehicle.id }),
        journeyModule.gateways.listVehicleJourneys.exec({ idToken, vehicleId: vehicle.id }),
      ]);
      setDetail(vehicleRes.body);
      setIncidents(incidentsRes.body);
      setJourneys(journeysRes.body);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
      setDetail(vehicle);
      setIncidents([]);
      setJourneys([]);
    } finally {
      setLoading(false);
    }
  }, [getToken, vehicle]);

  useEffect(() => {
    if (!open || !vehicle) {
      setDetail(null);
      setIncidents([]);
      setJourneys([]);
      setError(null);
      setIncidentsOpen(false);
      setJourneysOpen(false);
      return;
    }
    void load();
  }, [open, vehicle, load]);

  useEffect(() => {
    if (!open || loading || !initialSubView) return;
    if (initialSubView === "incidents") {
      setIncidentsOpen(true);
    } else if (initialSubView === "journeys") {
      setJourneysOpen(true);
    }
  }, [open, loading, initialSubView]);

  const current = detail ?? vehicle;

  return (
    <>
      <BottomSheetModal
        open={open && Boolean(current)}
        onClose={onClose}
        title={current ? `${current.marca} ${current.modelo}` : "Veículo"}
        description={current?.placa}
      >
        {loading && !detail ? (
          <View className="items-center py-10">
            <ActivityIndicator color={palette.spinner} />
          </View>
        ) : current ? (
          <View className="gap-y-4 pb-4">
            <Image
              source={{ uri: current.fotoUrl }}
              className="h-48 w-full rounded-2xl border border-border bg-muted"
              resizeMode="cover"
            />

            <View className="flex-row gap-3">
              <MetricCard label="Incidentes" value={String(incidents.length)} />
              <MetricCard label="Jornadas" value={String(journeys.length)} />
              <MetricCard label="Ano" value={String(current.ano)} />
            </View>

            {error ? (
              <Card className="p-4">
                <Text className="text-sm text-destructive">{error}</Text>
              </Card>
            ) : null}

            <Card className="gap-y-4">
              <View className="gap-y-1">
                <Text className="text-base font-semibold text-foreground">
                  Dados cadastrados
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Informações principais e administrativas do veículo.
                </Text>
              </View>

              <View className="gap-y-3">
                <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Identificação
                </Text>
                <View className="overflow-hidden rounded-2xl border border-border bg-background">
                  <DetailRow
                    label="Usuário"
                    value={current.userId ? String(current.userId) : "Nao vinculado"}
                  />
                  <DetailRow label="Marca" value={current.marca} />
                  <DetailRow label="Modelo" value={current.modelo} />
                  <DetailRow label="Placa" value={current.placa} />
                  <DetailRow label="Ano" value={String(current.ano)} isLast />
                </View>
              </View>

              <View className="gap-y-3">
                <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Especificações
                </Text>
                <View className="flex-row gap-3">
                  <MetaCard label="Tanque" value={`${current.tamanhoTanque} L`} />
                  <MetaCard
                    label="Consumo médio"
                    value={`${current.consumoMedio.toFixed(1)} km/L`}
                  />
                </View>
              </View>
            </Card>

            <View className="gap-y-3">
              <Text className="text-base font-semibold text-foreground">
                Registros do veículo
              </Text>
              <View className="flex-row gap-3">
                <SectionCard
                  icon="warning-outline"
                  title="Incidentes"
                  subtitle={`${incidents.length} registro(s)`}
                  iconColor={palette.primary}
                  onPress={() => setIncidentsOpen(true)}
                />
                <SectionCard
                  icon="git-compare-outline"
                  title="Jornadas"
                  subtitle={`${journeys.length} registro(s)`}
                  iconColor={palette.primary}
                  onPress={() => setJourneysOpen(true)}
                />
              </View>
            </View>
          </View>
        ) : null}
      </BottomSheetModal>

      {current ? (
        <>
          <VehicleIncidentsSheet
            open={incidentsOpen}
            vehicle={current}
            onClose={() => setIncidentsOpen(false)}
            onChanged={load}
          />
          <VehicleJourneysSheet
            open={journeysOpen}
            vehicle={current}
            onClose={() => setJourneysOpen(false)}
          />
        </>
      ) : null}
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl border border-border bg-card px-3 py-3">
      <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text className="mt-1 text-base font-semibold text-foreground">{value}</Text>
    </View>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  iconColor,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  iconColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-2xl border border-border bg-card p-4"
    >
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-accent">
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="mt-4 text-base font-semibold text-foreground">{title}</Text>
      <Text className="mt-1 text-sm text-muted-foreground">{subtitle}</Text>
      <View className="mt-4 flex-row items-center gap-1">
        <Text className="text-xs font-medium text-primary">Ver mais</Text>
        <Ionicons name="chevron-forward" size={14} color={iconColor} />
      </View>
    </Pressable>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl border border-border bg-background px-4 py-4">
      <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text className="mt-2 text-base font-semibold text-foreground">{value}</Text>
    </View>
  );
}

function DetailRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between gap-4 px-4 py-3.5 ${
        isLast ? "" : "border-b border-border"
      }`}
    >
      <Text className="shrink-0 text-sm text-muted-foreground">{label}</Text>
      <Text
        className="flex-1 text-right text-sm font-semibold text-foreground"
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
