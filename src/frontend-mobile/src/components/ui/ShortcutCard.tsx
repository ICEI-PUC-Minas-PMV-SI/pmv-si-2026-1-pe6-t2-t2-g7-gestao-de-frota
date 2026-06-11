import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, Href } from "expo-router";

import { useTheme } from "../../context/theme.context";
import { paletteFor } from "../../theme/tokens";

type Props = {
  href: Href;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function ShortcutCard({ href, title, description, icon }: Props) {
  const { theme } = useTheme();
  const palette = paletteFor(theme);
  return (
    <Link href={href} asChild>
      <Pressable className="rounded-xl border border-border bg-card p-5 shadow-card active:opacity-90">
        <View className="h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
          <Ionicons name={icon} size={20} color={palette.primary} />
        </View>
        <Text className="mt-4 text-lg font-semibold text-foreground">{title}</Text>
        <Text className="mt-1 text-sm text-muted-foreground">{description}</Text>
        <View className="mt-4 flex-row items-center">
          <Text className="text-sm font-medium text-primary">Abrir módulo</Text>
          <Ionicons name="arrow-forward" size={16} color={palette.primary} style={{ marginLeft: 4 }} />
        </View>
      </Pressable>
    </Link>
  );
}
