import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

type KpiTone = "primary" | "amber" | "red" | "emerald";

const toneStyles: Record<
  KpiTone,
  { iconBg: string; iconColor: string; valueColor: string }
> = {
  primary: { iconBg: "bg-accent", iconColor: "#1a237e", valueColor: "text-primary" },
  amber: { iconBg: "bg-[#fef3c7]", iconColor: "#b45309", valueColor: "text-[#b45309]" },
  red: { iconBg: "bg-[#fee2e2]", iconColor: "#dc2626", valueColor: "text-[#dc2626]" },
  emerald: {
    iconBg: "bg-[#dcfce7]",
    iconColor: "#16a34a",
    valueColor: "text-[#16a34a]",
  },
};

type Props = {
  label: string;
  value: number | string;
  unit?: string;
  hint?: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: KpiTone;
  href?: string;
};

export function KpiCard({
  label,
  value,
  unit,
  hint,
  icon,
  tone = "primary",
  href,
}: Props) {
  const styles = toneStyles[tone];
  const content = (
    <View className="w-full rounded-xl border border-border bg-card p-4 shadow-card">
      <View
        className={`mb-3 h-9 w-9 items-center justify-center rounded-lg ${styles.iconBg}`}
      >
        <Ionicons name={icon} size={18} color={styles.iconColor} />
      </View>
      <Text
        className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
        numberOfLines={2}
      >
        {label}
      </Text>
      <Text className={`mt-1 text-2xl font-semibold ${styles.valueColor}`}>
        {value}
        {unit ? (
          <Text className="text-sm font-normal text-muted-foreground"> {unit}</Text>
        ) : null}
      </Text>
      {hint ? (
        <Text className="mt-2 text-xs text-muted-foreground">{hint}</Text>
      ) : null}
    </View>
  );

  const shellClass = "w-[48%] max-w-[48%]";

  if (href) {
    return (
      <Link href={href as any} asChild>
        <Pressable className={shellClass}>{content}</Pressable>
      </Link>
    );
  }

  return <View className={shellClass}>{content}</View>;
}
