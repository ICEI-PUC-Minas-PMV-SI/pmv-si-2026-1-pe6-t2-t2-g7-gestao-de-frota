import { Text, View } from "react-native";

import { AppScreen } from "../../src/components/layout/AppScreen";
import { Card } from "../../src/components/ui/Card";
import { KpiCard } from "../../src/components/ui/KpiCard";
import { KpiGrid } from "../../src/components/ui/KpiGrid";
import { IncidentStatusChartCard } from "../../src/components/dashboard/IncidentStatusChartCard";
import { IncidentTypeChartCard } from "../../src/components/dashboard/IncidentTypeChartCard";
import { RecentJourneysSection } from "../../src/components/dashboard/RecentJourneysSection";
import { ModuleHeader } from "../../src/components/ui/ModuleHeader";
import { ScreenLoader } from "../../src/components/ui/ScreenLoader";
import { useFleetData } from "../../src/hooks/useFleetData";
import { useAuth } from "../../src/context/auth.context";
import { getGreeting } from "../../src/utils/format";

export default function DashboardScreen() {
  const { user } = useAuth();
  const {
    vehicles,
    stats,
    journeyStats,
    recentJourneys,
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
          description="Visão geral: frota, incidentes, jornadas recentes e indicadores da operação."
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
            label="Jornadas ativas"
            value={journeyStats.inProgress}
            unit="em andamento"
            icon="navigate-outline"
            tone="primary"
            href="/(app)/map"
            hint={`${journeyStats.completed} concluídas · ${journeyStats.total} no total`}
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
        <Text className="mb-3 text-sm font-semibold text-foreground">
          Visão analítica
        </Text>
        <View className="gap-y-3">
          <IncidentStatusChartCard
            byStatus={stats.byStatus}
            total={stats.total}
          />
          <IncidentTypeChartCard
            multasCount={stats.multasCount}
            sinistrosCount={stats.sinistrosCount}
            multasValor={stats.multasValor}
          />
        </View>
      </View>

      <RecentJourneysSection journeys={recentJourneys} stats={journeyStats} />
    </AppScreen>
  );
}
