import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

import { useTheme } from "../../context/theme.context";
import { surfaceFor, type SurfaceColors } from "../../theme/surfaceColors";

type KpiTone = "primary" | "amber" | "red" | "emerald";

const toneStyles: Record<
  KpiTone,
  { iconBg: string; iconColor: (s: SurfaceColors) => string; valueColor: string }
> = {
  primary: {
    iconBg: "bg-accent",
    iconColor: (s) => s.primary,
    valueColor: "text-primary",
  },
  amber: {
    iconBg: "bg-tone-warning-bg",
    iconColor: (s) => s.warning,
    valueColor: "text-tone-warning-fg",
  },
  red: {
    iconBg: "bg-tone-danger-bg",
    iconColor: (s) => s.destructive,
    valueColor: "text-tone-danger-fg",
  },
  emerald: {
    iconBg: "bg-tone-success-bg",
    iconColor: (s) => s.success,
    valueColor: "text-tone-success-fg",
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
  const { theme } = useTheme();
  const styles = toneStyles[tone];
  const iconColor = styles.iconColor(surfaceFor(theme));
  const content = (
    <View className="min-h-[148px] w-full flex-1 justify-between rounded-xl border border-border bg-card p-4 shadow-card">
      <View className="min-w-0">
        <View
          className={`mb-3 h-9 w-9 items-center justify-center rounded-lg ${styles.iconBg}`}
        >
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text
          className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
          numberOfLines={2}
        >
          {label}
        </Text>
        <Text
          className={`mt-1 text-2xl font-semibold ${styles.valueColor}`}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {value}
          {unit ? (
            <Text className="text-sm font-normal text-muted-foreground"> {unit}</Text>
          ) : null}
        </Text>
      </View>
      {hint ? (
        <Text className="mt-3 text-xs leading-4 text-muted-foreground" numberOfLines={2}>
          {hint}
        </Text>
      ) : (
        <View className="mt-3 h-4" />
      )}
    </View>
  );

  if (href) {
    return (
      <Link href={href as any} asChild>
        <Pressable className="h-full w-full min-w-0 flex-1">{content}</Pressable>
      </Link>
    );
  }

  return <View className="h-full w-full min-w-0 flex-1">{content}</View>;
}
