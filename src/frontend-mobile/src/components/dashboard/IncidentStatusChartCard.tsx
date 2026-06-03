import { Text, View } from "react-native";

import { ChartLegend } from "../charts/ChartLegend";
import { DonutChart } from "../charts/DonutChart";
import { Card } from "../ui/Card";
import type { Incident } from "../../core/modules/incidents/types";
import { STATUS_LABEL } from "../../theme/incidents";

const STATUS_COLORS: Record<Incident["status"], string> = {
  aberto: "#f59e0b",
  em_analise: "#3b82f6",
  resolvido: "#10b981",
  cancelado: "#94a3b8",
};

type Props = {
  byStatus: Record<Incident["status"], number>;
  total: number;
};

export function IncidentStatusChartCard({ byStatus, total }: Props) {
  const segments = (Object.keys(byStatus) as Incident["status"]).map((key) => ({
    label: STATUS_LABEL[key],
    value: byStatus[key],
    color: STATUS_COLORS[key],
  }));

  return (
    <Card>
      <Text className="text-sm font-semibold text-foreground">
        Status dos incidentes
      </Text>
      <Text className="mt-0.5 text-xs text-muted-foreground">
        Distribuição por etapa do fluxo
      </Text>
      <View className="mt-4 flex-row items-center gap-5">
        <DonutChart
          segments={segments}
          centerLabel={String(total)}
          centerSubLabel={total === 1 ? "caso" : "casos"}
        />
        <View className="min-w-0 flex-1">
          <ChartLegend segments={segments} />
        </View>
      </View>
    </Card>
  );
}
