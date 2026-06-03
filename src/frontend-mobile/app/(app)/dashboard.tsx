import { Text, View } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppScreen } from "../../src/components/layout/AppScreen";
import { Badge } from "../../src/components/ui/Badge";
import { Card } from "../../src/components/ui/Card";
import { KpiCard } from "../../src/components/ui/KpiCard";
import { KpiGrid } from "../../src/components/ui/KpiGrid";
import { ModuleHeader } from "../../src/components/ui/ModuleHeader";
import { ScreenLoader } from "../../src/components/ui/ScreenLoader";
import { useFleetData } from "../../src/hooks/useFleetData";
import {
  SEVERITY_LABEL,
  SEVERITY_TONE,
  STATUS_LABEL,
  STATUS_TONE,
} from "../../src/theme/incidents";
import { useAuth } from "../../src/context/auth.context";
import { formatCurrency, formatRelative, getGreeting } from "../../src/utils/format";

export default function DashboardScreen() {
  const { user } = useAuth();
  const {
    vehicles,
    stats,
    recentIncidents,
    loading,
    refreshing,
    error,
    refreshedAt,
    refresh,
  } = useFleetData();

  if (loading) {
    return <ScreenLoader message="Carregando painel..." />;
  }

  const greeting = getGreeting();
  const firstName =
    user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "operador";
  const updatedLabel = refreshedAt
    ? `Atualizado às ${refreshedAt.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "—";

  return (
    <AppScreen
      refreshing={refreshing}
      onRefresh={refresh}
      header={
        <ModuleHeader
          eyebrow="Painel da frota"
          title={`${greeting}, ${firstName}`}
          description="Visão geral da operação: veículos, incidentes em andamento e indicadores que merecem atenção."
          right={
            <Text className="max-w-[100px] text-right text-[10px] text-muted-foreground">
              {updatedLabel}
            </Text>
          }
        />
      }
      scroll
    >
      {error ? (
        <Card>
          <Text className="text-sm text-destructive">{error}</Text>
          <Text className="mt-1 text-xs text-muted-foreground">
            Verifique EXPO_PUBLIC_API_URL e o token quando a autenticação estiver
            ativa.
          </Text>
        </Card>
      ) : null}

      <View>
        <KpiGrid>
          <KpiCard
            label="Frota cadastrada"
            value={vehicles.length}
            unit="veículos"
            icon="car-outline"
            tone="primary"
            href="/(app)/vehicles"
            hint={
              vehicles.length === 0
                ? "Cadastre veículos na web"
                : "Ver catálogo completo"
            }
          />
          <KpiCard
            label="Incidentes ativos"
            value={stats.ativos}
            unit="em andamento"
            icon="warning-outline"
            tone="amber"
            href="/(app)/incidents"
            hint={`${stats.byStatus.aberto} abertos · ${stats.byStatus.em_analise} em análise`}
          />
          <KpiCard
            label="Casos críticos"
            value={stats.bySeverity.critica + stats.bySeverity.alta}
            unit="alta severidade"
            icon="alert-circle-outline"
            tone="red"
            href="/(app)/incidents"
            hint={`${stats.bySeverity.critica} críticos · ${stats.bySeverity.alta} altos`}
          />
          <KpiCard
            label="Taxa de resolução"
            value={`${stats.taxaResolucao}%`}
            icon="checkmark-circle-outline"
            tone="emerald"
            hint={`${stats.resolvidos} resolvidos de ${stats.total}`}
          />
        </KpiGrid>
      </View>

      <View>
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-foreground">
            Incidentes recentes
          </Text>
          <Link href="/(app)/incidents">
            <Text className="text-xs font-medium text-primary">Ver todos</Text>
          </Link>
        </View>
        {recentIncidents.length === 0 ? (
          <Card>
            <Text className="text-sm text-muted-foreground">
              Nenhum incidente registrado.
            </Text>
          </Card>
        ) : (
          <View className="gap-y-3">
            {recentIncidents.map((inc) => (
              <Card key={inc.id}>
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold capitalize text-foreground">
                      {inc.tipo}
                    </Text>
                    <Text className="mt-1 text-xs text-muted-foreground" numberOfLines={2}>
                      {inc.descricao}
                    </Text>
                    {inc.vehicle ? (
                      <Text className="mt-2 font-mono text-xs text-muted-foreground">
                        {inc.vehicle.placa} · {inc.vehicle.marca} {inc.vehicle.modelo}
                      </Text>
                    ) : null}
                  </View>
                  <Badge tone={SEVERITY_TONE[inc.severidade]}>
                    {SEVERITY_LABEL[inc.severidade]}
                  </Badge>
                </View>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-xs text-muted-foreground">
                    {formatRelative(inc.data)}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Badge tone={STATUS_TONE[inc.status]}>
                      {STATUS_LABEL[inc.status]}
                    </Badge>
                    {typeof inc.valor === "number" ? (
                      <Text className="text-xs font-medium text-foreground">
                        {formatCurrency(inc.valor)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      <Card>
        <View className="flex-row flex-wrap gap-4">
          <View>
            <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Multas
            </Text>
            <Text className="mt-1 text-lg font-semibold text-foreground">
              {stats.multasCount}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {formatCurrency(stats.multasValor)}
            </Text>
          </View>
          <View>
            <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Sinistros
            </Text>
            <Text className="mt-1 text-lg font-semibold text-foreground">
              {stats.sinistrosCount}
            </Text>
          </View>
        </View>
      </Card>

    </AppScreen>
  );
}
