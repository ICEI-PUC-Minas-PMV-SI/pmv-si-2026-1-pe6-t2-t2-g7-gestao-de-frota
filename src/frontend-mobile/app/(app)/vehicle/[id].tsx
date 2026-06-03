import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Card } from "../../../src/components/ui/Card";
import { journeyModule, JourneyHistory } from "../../../src/core/modules/journeys/journeys";
import { vehicleModule, Vehicle } from "../../../src/core/modules/vehicles/vehicles";
import { incidentModule, Incident } from "../../../src/core/modules/incidents/incidents";
import { useAuthorizedToken } from "../../../src/hooks/useAuthorizedToken";

export default function VehicleDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const getToken = useAuthorizedToken();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [journeys, setJourneys] = useState<JourneyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const idToken = await getToken();
      const [vehicleRes, incidentsRes, journeysRes] = await Promise.all([
        vehicleModule.gateways.get.exec({ idToken, vehicleId: id }),
        incidentModule.gateways.listByVehicle.exec({ idToken, vehicleId: id }),
        journeyModule.gateways.listVehicleJourneys.exec({ idToken, vehicleId: id }),
      ]);
      setVehicle(vehicleRes.body);
      setIncidents(incidentsRes.body);
      setJourneys(journeysRes.body);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar o veículo.");
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
          title: vehicle.placa,
          headerBackTitle: "Veículos",
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
            onPress={() => router.replace("/vehicles")}
            className="flex-row items-center self-start rounded-full border border-border bg-card px-3 py-2"
          >
            <Ionicons name="arrow-back" size={16} color="#1a237e" />
            <Text className="ml-2 text-sm font-medium text-primary">Voltar</Text>
          </Pressable>

          <View className="gap-y-2 px-1">
            <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Veículo
            </Text>
            <Text className="text-3xl font-semibold tracking-tight text-foreground">
              {vehicle.marca} {vehicle.modelo}
            </Text>
            <Text className="text-sm text-muted-foreground">{vehicle.placa}</Text>
          </View>

          <Image
            source={{ uri: vehicle.fotoUrl }}
            className="h-56 w-full rounded-2xl border border-border bg-muted"
            resizeMode="cover"
          />

          <View className="flex-row gap-3">
            <MetricCard label="Incidentes" value={String(incidents.length)} />
            <MetricCard label="Jornadas" value={String(journeys.length)} />
            <MetricCard label="Ano" value={String(vehicle.ano)} />
          </View>

          {error ? (
            <Card className="p-4">
              <Text className="text-sm text-red-500">{error}</Text>
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
              <View className="flex-row flex-wrap gap-3">
                <MetaCard
                  label="Usuário"
                  value={vehicle.userId ? String(vehicle.userId) : "Nao vinculado"}
                />
                <MetaCard label="Marca" value={vehicle.marca} />
                <MetaCard label="Modelo" value={vehicle.modelo} />
                <MetaCard label="Placa" value={vehicle.placa} />
                <MetaCard label="Ano" value={String(vehicle.ano)} />
              </View>
            </View>

            <View className="gap-y-3">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Especificações
              </Text>
              <View className="flex-row flex-wrap gap-3">
                <MetaCard label="Tanque" value={`${vehicle.tamanhoTanque} L`} />
                <MetaCard
                  label="Consumo médio"
                  value={`${vehicle.consumoMedio.toFixed(1)} km/L`}
                />
              </View>
            </View>

          </Card>

          <View className="gap-y-3">
            <Text className="px-1 text-base font-semibold text-foreground">
              Registros do veículo
            </Text>
            <View className="flex-row gap-3">
              <SectionCard
                icon="warning-outline"
                title="Incidentes"
                subtitle={`${incidents.length} registro(s)`}
                onPress={() => router.push(`/(app)/vehicle/${vehicle.id}/incidents`)}
              />
              <SectionCard
                icon="git-compare-outline"
                title="Jornadas"
                subtitle={`${journeys.length} registro(s)`}
                onPress={() => router.push(`/(app)/vehicle/${vehicle.id}/journeys`)}
              />
            </View>
          </View>
        </View>
      </ScrollView>
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

function SectionCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-2xl border border-border bg-card p-4"
    >
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#eff6ff]">
        <Ionicons name={icon} size={20} color="#1a237e" />
      </View>
      <Text className="mt-4 text-base font-semibold text-foreground">{title}</Text>
      <Text className="mt-1 text-sm text-muted-foreground">{subtitle}</Text>
      <View className="mt-4 flex-row items-center gap-1">
        <Text className="text-xs font-medium text-primary">Ver mais</Text>
        <Ionicons name="chevron-forward" size={14} color="#1a237e" />
      </View>
    </Pressable>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[140px] flex-1 rounded-2xl border border-border bg-background px-4 py-3">
      <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text className="mt-2 text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}
