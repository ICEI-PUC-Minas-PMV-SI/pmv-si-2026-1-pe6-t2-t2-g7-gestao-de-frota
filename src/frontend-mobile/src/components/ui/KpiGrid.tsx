import { Children, ReactElement, ReactNode, isValidElement } from "react";
import { View } from "react-native";

/** Grade 2 colunas com linhas explícitas — alturas iguais por linha e gap consistente. */
export function KpiGrid({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement[];
  const rows: ReactElement[][] = [];

  for (let index = 0; index < items.length; index += 2) {
    rows.push(items.slice(index, index + 2));
  }

  return (
    <View className="gap-3">
      {rows.map((row, rowIndex) => (
        <View key={row.key ?? `kpi-row-${rowIndex}`} className="flex-row gap-3">
          {row.map((item) => (
            <View key={item.key} className="min-w-0 flex-1">
              {item}
            </View>
          ))}
          {row.length === 1 ? <View className="min-w-0 flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}
