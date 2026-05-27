import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ModuleHeader } from "../../src/components/ui/ModuleHeader";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { KpiCard } from "../../src/components/ui/KpiCard";
import { KpiGrid } from "../../src/components/ui/KpiGrid";
import { IncidentCard } from "../../src/components/incidents/IncidentCard";
import {
  IncidentFormSheet,
  confirmDeleteIncident,
} from "../../src/components/incidents/IncidentFormSheet";
import { ScreenLoader } from "../../src/components/ui/ScreenLoader";
import { SearchInput } from "../../src/components/ui/SearchInput";
import { useAuthorizedToken } from "../../src/hooks/useAuthorizedToken";
import { useFleetData } from "../../src/hooks/useFleetData";
import {
  incidentModule,
  type Incident,
} from "../../src/core/modules/incidents/incidents";
import type { IncidentStatus } from "../../src/core/modules/incidents/types";

const STATUS_FILTERS: Array<{ key: IncidentStatus | "todos"; label: string }> = [
  { key: "todos", label: "Todos" },
  { key: "aberto", label: "Abertos" },
  { key: "em_analise", label: "Em análise" },
  { key: "resolvido", label: "Resolvidos" },
];

export default function IncidentsScreen() {
  const insets = useSafeAreaInsets();
  const getToken = useAuthorizedToken();
  const { vehicles, incidents, stats, loading, refreshing, error, refresh } =
    useFleetData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "todos">(
    "todos",
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Incident | null>(null);

  const vehicleById = useMemo(
    () => new Map(vehicles.map((v) => [v.id, v])),
    [vehicles],
  );

  const filtered = useMemo(() => {
    let list = incidents;
    if (statusFilter !== "todos") {
      list = list.filter((i) => i.status === statusFilter);
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (i) =>
        i.descricao.toLowerCase().includes(q) ||
        i.tipo.toLowerCase().includes(q),
    );
  }, [incidents, query, statusFilter]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(incident: Incident) {
    setEditing(incident);
    setFormOpen(true);
  }

  function handleDelete(incident: Incident) {
    confirmDeleteIncident(incident, async () => {
      try {
        const idToken = await getToken();
        await incidentModule.gateways.delete.exec({
          idToken,
          incidentId: incident.id,
        });
        await refresh();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Erro ao excluir incidente.";
        Alert.alert("Erro", message);
      }
    });
  }

  if (loading) {
    return <ScreenLoader message="Carregando incidentes..." />;
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ModuleHeader
        eyebrow="Operação"
        title="Incidentes"
        description="Multas e sinistros — criar, editar e excluir registros."
      />
      <FlatList
        className="flex-1"
        data={filtered}
        keyExtractor={(i) => i.id}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 100 }}
        ListHeaderComponent={
          <View className="mb-4 gap-y-4">
            {error ? (
              <Card>
                <Text className="text-sm text-destructive">{error}</Text>
              </Card>
            ) : null}
            <KpiGrid>
              <KpiCard
                label="Ativos"
                value={stats.ativos}
                icon="warning-outline"
                tone="amber"
              />
              <KpiCard
                label="Total"
                value={stats.total}
                icon="document-text-outline"
                tone="primary"
              />
            </KpiGrid>
            <Button onPress={openCreate} disabled={vehicles.length === 0}>
              Novo incidente
            </Button>
            {vehicles.length === 0 ? (
              <Text className="text-xs text-muted-foreground">
                Cadastre um veículo na aba Frota antes de registrar incidentes.
              </Text>
            ) : null}
            <SearchInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por descrição ou tipo..."
            />
            <View className="flex-row flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => {
                const active = statusFilter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => setStatusFilter(f.key)}
                    className={`rounded-full border px-3 py-1.5 ${
                      active
                        ? "border-primary bg-primary"
                        : "border-border bg-card"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        active ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center pt-8">
            <Text className="text-sm text-muted-foreground">
              Nenhum incidente encontrado.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <IncidentCard
            incident={item}
            vehicle={vehicleById.get(item.vehicleId)}
            onEdit={() => openEdit(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
      />

      <IncidentFormSheet
        visible={formOpen}
        incident={editing}
        vehicles={vehicles}
        onClose={() => setFormOpen(false)}
        onSaved={() => refresh()}
      />
    </View>
  );
}
