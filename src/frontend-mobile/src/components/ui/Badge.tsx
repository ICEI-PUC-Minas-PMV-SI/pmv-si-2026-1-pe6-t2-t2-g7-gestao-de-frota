import { Text, View } from "react-native";

type Tone = "neutral" | "primary" | "success" | "warning" | "destructive";

const tones: Record<Tone, string> = {
  neutral: "bg-muted",
  primary: "bg-accent",
  success: "bg-[#dcfce7]",
  warning: "bg-[#fef3c7]",
  destructive: "bg-[#fee2e2]",
};

const textTones: Record<Tone, string> = {
  neutral: "text-muted-foreground",
  primary: "text-accent-foreground",
  success: "text-[#166534]",
  warning: "text-[#92400e]",
  destructive: "text-[#991b1b]",
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
      <Text className={`text-[11px] font-semibold ${textTones[tone]}`}>
        {children}
      </Text>
    </View>
  );
}
