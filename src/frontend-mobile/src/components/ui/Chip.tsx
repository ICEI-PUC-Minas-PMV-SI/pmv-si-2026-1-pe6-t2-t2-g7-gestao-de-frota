import { Text, View } from "react-native";

export function Chip({
  children,
  variant = "muted",
}: {
  children: string;
  variant?: "primary" | "muted";
}) {
  const container =
    variant === "primary"
      ? "border border-primary/20 bg-primary/10"
      : "border border-border bg-muted/50";
  const text =
    variant === "primary" ? "text-primary" : "text-muted-foreground";

  return (
    <View className={`self-start rounded-full px-3 py-1 ${container}`}>
      <Text className={`text-xs font-medium ${text}`}>{children}</Text>
    </View>
  );
}
