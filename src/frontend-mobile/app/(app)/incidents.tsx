import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  confirmDeleteIncident,
  IncidentFormSheet,
} from "../../src/components/incidents/IncidentFormSheet";
import { IncidentCard } from "../../src/components/incidents/IncidentCard";
import { AppScreen } from "../../src/components/layout/AppScreen";
import { Badge } from "../../src/components/ui/Badge";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { ModuleHeader } from "../../src/components/ui/ModuleHeader";
import { ScreenLoader } from "../../src/components/ui/ScreenLoader";
import {
  incidentModule,
  type Incident,
  type IncidentStatus,
} from "../../src/core/modules/incidents/incidents";
import { vehicleModule, type Vehicle } from "../../src/core/modules/vehicles/vehicles";
import { useAuthorizedToken } from "../../src/hooks/useAuthorizedToken";
import { STATUS_LABEL } from "../../src/theme/incidents";
import { getApiErrorMessage } from "../../src/utils/apiError";

const STATUS_FILTERS: { value: "all" | IncidentStatus; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "aberto", label: STATUS_LABEL.aberto },
  { value: "em_analise", label: STATUS_LABEL.em_analise },
  { value: "resolvido", label: STATUS_LABEL.resolvido },
  { value: "cancelado", label: STATUS_LABEL.cancelado },
];

export default function IncidentsScreen() {
  const getToken = useAuthorizedToken();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | IncidentStatus>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Incident | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const idToken = await getToken();
      const [incidentsRes, vehiclesRes] = await Promise.all([
        incidentModule.gateways.list.exec({ idToken }),
        vehicleModule.gateways.list.exec({ idToken }),
      ]);
      setIncidents(incidentsRes.body);
      setVehicles(vehiclesRes.body);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const vehicleById = useMemo(
    () => new Map(vehicles.map((v) => [v.id, v])),
    [vehicles],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return incidents.filter((inc) => {
      if (statusFilter !== "all" && inc.status !== statusFilter) return false;
      if (!q) return true;
      const vehicle = vehicleById.get(inc.vehicleId);
      const haystack = [
        inc.tipo,
        inc.descricao,
        inc.status,
        inc.severidade,
        vehicle?.placa,
        vehicle?.marca,
        vehicle?.modelo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [incidents, search, statusFilter, vehicleById]);

  const stats = useMemo(() => {
    const ativos = incidents.filter(
      (i) => i.status === "aberto" || i.status === "em_analise",
    ).length;
    return { total: incidents.length, ativos };
  }, [incidents]);

  async function onDelete(incident: Incident) {
    try {
      const idToken = await getToken();
      await incidentModule.gateways.delete.exec({
        idToken,
        incidentId: incident.id,
      });
      await load();
    } catch {
      // Toast no adapter.
    }
  }

  if (loading) {
    return <ScreenLoader message="Carregando incidentes..." />;
  }

  return (
    <>
      <AppScreen
        scroll={false}
        padded={false}
        header={
          <ModuleHeader
            eyebrow="Operação"
            title="Incidentes"
            description="Multas e sinistros da frota — consulte, edite e registre novos casos."
          />
        }
      >
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load();
              }}
            />
          }
          ListHeaderComponent={
            <View className="gap-y-4 pb-4 pt-2">
              {error ? (
                <Card>
                  <Text className="text-sm text-destructive">{error}</Text>
                </Card>
              ) : null}

              <View className="flex-row gap-3">
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
                    {stats.ativos}
                  </Text>
                </Card>
              </View>

              <Button
                onPress={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
                disabled={vehicles.length === 0}
              >
                Novo incidente
              </Button>
              {vehicles.length === 0 ? (
                <Text className="text-center text-xs text-muted-foreground">
                  Cadastre um veículo na aba Frota para registrar incidentes.
                </Text>
              ) : null}

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por placa, tipo ou descrição..."
                placeholderTextColor="#94a3b8"
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
              />

              <View className="flex-row flex-wrap gap-2">
                {STATUS_FILTERS.map((item) => (
                  <Pressable
                    key={item.value}
                    onPress={() => setStatusFilter(item.value)}
                    className={`rounded-full border px-3 py-1.5 ${
                      statusFilter === item.value
                        ? "border-primary bg-primary"
                        : "border-border bg-card"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        statusFilter === item.value
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-foreground">
                  Registros
                </Text>
                <Badge tone="neutral">{String(filtered.length)}</Badge>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View className="mb-3">
              <IncidentCard
                incident={item}
                vehicle={vehicleById.get(item.vehicleId)}
                onEdit={() => {
                  setEditing(item);
                  setFormOpen(true);
                }}
                onDelete={() =>
                  confirmDeleteIncident(item, () => void onDelete(item))
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <Card>
              <Text className="text-sm text-muted-foreground">
                {incidents.length === 0
                  ? "Nenhum incidente registrado."
                  : "Nenhum resultado para os filtros atuais."}
              </Text>
            </Card>
          }
        />
      </AppScreen>

      <IncidentFormSheet
        visible={formOpen}
        incident={editing}
        vehicles={vehicles}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={() => void load()}
      />
    </>
  );
}
