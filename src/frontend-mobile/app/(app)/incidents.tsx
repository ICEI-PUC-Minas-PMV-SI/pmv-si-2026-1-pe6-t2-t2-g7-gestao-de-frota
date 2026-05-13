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
import {
  incidentModule,
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from "../../src/core/modules/incidents/incidents";

const severityTone: Record<IncidentSeverity, "neutral" | "warning" | "destructive" | "success"> = {
  baixa: "success",
  media: "warning",
  alta: "destructive",
  critica: "destructive",
};

const statusLabel: Record<IncidentStatus, string> = {
  aberto: "Aberto",
  em_analise: "Em análise",
  resolvido: "Resolvido",
  cancelado: "Cancelado",
};

export default function IncidentsScreen() {
  const getToken = useAuthorizedToken();
  const [items, setItems] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const idToken = await getToken();
      const res = await incidentModule.gateways.list.exec({ idToken });
      setItems(res.body);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar incidentes.");
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
      keyExtractor={(i) => i.id}
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
            {error ?? "Nenhum incidente registrado."}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Card>
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold capitalize text-foreground">
              {item.tipo}
            </Text>
            <Badge tone={severityTone[item.severidade]}>
              {item.severidade.toUpperCase()}
            </Badge>
          </View>
          <Text className="mt-2 text-sm text-muted-foreground">
            {item.descricao}
          </Text>
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-xs text-muted-foreground">
              {new Date(item.data).toLocaleDateString("pt-BR")}
            </Text>
            <Badge tone="neutral">{statusLabel[item.status]}</Badge>
          </View>
          {typeof item.valor === "number" ? (
            <Text className="mt-2 text-sm font-medium text-foreground">
              R$ {item.valor.toFixed(2)}
            </Text>
          ) : null}
        </Card>
      )}
    />
  );
}
