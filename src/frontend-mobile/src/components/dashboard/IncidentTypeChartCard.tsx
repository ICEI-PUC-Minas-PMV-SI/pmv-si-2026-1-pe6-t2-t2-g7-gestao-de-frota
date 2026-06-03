import { Text, View } from "react-native";

import { ChartLegend } from "../charts/ChartLegend";
import { DonutChart } from "../charts/DonutChart";
import { Card } from "../ui/Card";
import { formatCurrency } from "../../utils/format";

type Props = {
  multasCount: number;
  sinistrosCount: number;
  multasValor: number;
};

export function IncidentTypeChartCard({
  multasCount,
  sinistrosCount,
  multasValor,
}: Props) {
  const total = multasCount + sinistrosCount;
  const segments = [
    { label: "Multas", value: multasCount, color: "#f59e0b" },
    { label: "Sinistros", value: sinistrosCount, color: "#ef4444" },
  ];

  return (
    <Card>
      <Text className="text-sm font-semibold text-foreground">
        Tipos de incidente
      </Text>
      <Text className="mt-0.5 text-xs text-muted-foreground">
        Multas e sinistros registrados
      </Text>
      {total === 0 ? (
        <Text className="mt-4 text-sm text-muted-foreground">
          Nenhum incidente registrado ainda.
        </Text>
      ) : (
        <View className="mt-4 flex-row items-center gap-5">
          <DonutChart
            segments={segments}
            centerLabel={String(total)}
            centerSubLabel={total === 1 ? "caso" : "casos"}
          />
          <View className="min-w-0 flex-1">
            <ChartLegend segments={segments} />
            {multasCount > 0 ? (
              <Text className="mt-3 text-[10px] text-muted-foreground">
                Valor em multas: {formatCurrency(multasValor)}
              </Text>
            ) : null}
          </View>
        </View>
      )}
    </Card>
  );
}
