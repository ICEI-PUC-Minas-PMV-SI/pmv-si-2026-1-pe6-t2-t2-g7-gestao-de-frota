import { View } from "react-native";
import { ReactNode } from "react";

/** Grade 2 colunas para KPIs no mobile (evita flex-1 espremendo os cards). */
export function KpiGrid({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-3">{children}</View>
  );
}
