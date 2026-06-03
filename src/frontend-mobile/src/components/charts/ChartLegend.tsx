import { Text, View } from "react-native";

import type { DonutSegment } from "./DonutChart";

type Props = {
  segments: DonutSegment[];
};

export function ChartLegend({ segments }: Props) {
  const visible = segments.filter((s) => s.value > 0);
  if (visible.length === 0) {
    return (
      <Text className="text-xs text-muted-foreground">Sem dados para exibir</Text>
    );
  }

  return (
    <View className="gap-y-2">
      {visible.map((s) => (
        <View key={s.label} className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <View
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <Text className="text-xs text-foreground" numberOfLines={1}>
              {s.label}
            </Text>
          </View>
          <Text className="text-xs font-semibold tabular-nums text-foreground">
            {s.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
