import { ReactNode } from "react";
import { Text, View } from "react-native";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  right?: ReactNode;
};

export function ModuleHeader({ eyebrow, title, description, right }: Props) {
  return (
    <View className="flex-row items-start justify-between gap-3 border-b border-border/70 bg-background px-5 pb-5 pt-2">
      <View className="flex-1">
        <Text className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </Text>
        <Text className="mt-1.5 text-2xl font-semibold text-foreground">{title}</Text>
        {description ? (
          <Text className="mt-1.5 text-sm leading-5 text-muted-foreground">
            {description}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
