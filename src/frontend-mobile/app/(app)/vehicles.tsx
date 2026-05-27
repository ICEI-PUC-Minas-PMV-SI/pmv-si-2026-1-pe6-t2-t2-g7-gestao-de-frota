import { useMemo, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { KpiCard } from "../../src/components/ui/KpiCard";
import { KpiGrid } from "../../src/components/ui/KpiGrid";
import {
  VehicleFormSheet,
  confirmDeleteVehicle,
} from "../../src/components/vehicles/VehicleFormSheet";
import { VehicleCard } from "../../src/components/vehicles/VehicleCard";
import { ModuleHeader } from "../../src/components/ui/ModuleHeader";
import { ScreenLoader } from "../../src/components/ui/ScreenLoader";
import { SearchInput } from "../../src/components/ui/SearchInput";
import { useAuthorizedToken } from "../../src/hooks/useAuthorizedToken";
import { useFleetData } from "../../src/hooks/useFleetData";
import { vehicleModule, type Vehicle } from "../../src/core/modules/vehicles/vehicles";

export default function VehiclesScreen() {
  const insets = useSafeAreaInsets();
  const getToken = useAuthorizedToken();
  const { vehicles, loading, refreshing, error, refresh } = useFleetData();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.placa.toLowerCase().includes(q) ||
        v.marca.toLowerCase().includes(q) ||
        v.modelo.toLowerCase().includes(q),
    );
  }, [vehicles, query]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(vehicle: Vehicle) {
    setEditing(vehicle);
    setFormOpen(true);
  }

  function handleDelete(vehicle: Vehicle) {
    confirmDeleteVehicle(vehicle, async () => {
      try {
        const idToken = await getToken();
        await vehicleModule.gateways.delete.exec({
          idToken,
          vehicleId: vehicle.id,
        });
        await refresh();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Erro ao excluir veículo.";
        Alert.alert("Erro", message);
      }
    });
  }

  if (loading) {
    return <ScreenLoader message="Carregando frota..." />;
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ModuleHeader
        eyebrow="Gestão de frota"
        title="Veículos"
        description="Cadastre, edite e remova veículos da frota."
      />
      <FlatList
        className="flex-1"
        data={filtered}
        keyExtractor={(v) => v.id}
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
                label="Total"
                value={vehicles.length}
                unit="veículos"
                icon="car-outline"
              />
              <KpiCard
                label="Consumo médio"
                value={
                  vehicles.length
                    ? (
                        vehicles.reduce((s, v) => s + v.consumoMedio, 0) /
                        vehicles.length
                      ).toFixed(1)
                    : "—"
                }
                unit="km/L"
                icon="speedometer-outline"
                tone="emerald"
              />
            </KpiGrid>
            <Button onPress={openCreate}>Novo veículo</Button>
            <SearchInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por placa, marca ou modelo..."
            />
          </View>
        }
        ListEmptyComponent={
          <View className="items-center pt-8">
            <Text className="text-sm text-muted-foreground">
              {error ?? "Nenhum veículo encontrado."}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onEdit={() => openEdit(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
      />

      <VehicleFormSheet
        visible={formOpen}
        vehicle={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => refresh()}
      />
    </View>
  );
}
