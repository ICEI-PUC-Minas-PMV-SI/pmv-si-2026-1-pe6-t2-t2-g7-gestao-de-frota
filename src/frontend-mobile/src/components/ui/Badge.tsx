import { Text, View } from "react-native";

export type Tone = "neutral" | "primary" | "success" | "warning" | "destructive";

const tones: Record<Tone, string> = {
  neutral: "bg-muted border border-border",
  primary: "bg-accent border border-border",
  success: "bg-tone-success-bg",
  warning: "bg-tone-warning-bg",
  destructive: "bg-tone-danger-bg",
};

const textTones: Record<Tone, string> = {
  neutral: "text-muted-foreground",
  primary: "text-accent-foreground",
  success: "text-tone-success-fg",
  warning: "text-tone-warning-fg",
  destructive: "text-tone-danger-fg",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: string;
  tone?: Tone;
}) {
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${tones[tone]}`}>
      <Text className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${textTones[tone]}`}>
        {children}
      </Text>
    </View>
  );
}
