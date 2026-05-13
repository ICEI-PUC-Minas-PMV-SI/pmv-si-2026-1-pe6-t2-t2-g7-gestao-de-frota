import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { Badge } from "../../src/components/ui/Badge";
import { Card } from "../../src/components/ui/Card";
import { useAuthorizedToken } from "../../src/hooks/useAuthorizedToken";
import { vehicleModule, Vehicle } from "../../src/core/modules/vehicles/vehicles";

export default function VehiclesScreen() {
  const getToken = useAuthorizedToken();
  const [items, setItems] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const idToken = await getToken();
      const res = await vehicleModule.gateways.list.exec({ idToken });
      setItems(res.body);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar veículos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

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

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, gap: 12 }}
      data={items}
      keyExtractor={(v) => v.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
        />
      }
      ListEmptyComponent={
        <View className="items-center pt-10">
          <Text className="text-sm text-muted-foreground">
            {error ?? "Nenhum veículo cadastrado."}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Card>
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">
              {item.marca} {item.modelo}
            </Text>
            <Badge tone="primary">{item.placa}</Badge>
          </View>
          <View className="mt-3 flex-row flex-wrap gap-3">
            <Stat label="Ano" value={String(item.ano)} />
            <Stat label="Tanque" value={`${item.tamanhoTanque} L`} />
            <Stat
              label="Consumo"
              value={`${item.consumoMedio.toFixed(1)} km/L`}
            />
          </View>
        </Card>
      )}
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text className="text-sm font-medium text-foreground">{value}</Text>
    </View>
  );
}
