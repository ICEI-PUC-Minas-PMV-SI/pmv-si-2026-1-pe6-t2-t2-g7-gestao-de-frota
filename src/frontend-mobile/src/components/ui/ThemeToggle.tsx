import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../context/theme.context";
import { paletteFor } from "../../theme/tokens";

type Props = {
  /** Botão compacto (só ícone), como na sidebar do web. */
  compact?: boolean;
  className?: string;
  /** Cor do ícone (ex.: sobre o hero escuro do login). */
  iconColor?: string;
};

export function ThemeToggle({
  compact = false,
  className = "",
  iconColor,
}: Props) {
  const { theme, toggleTheme, transitioning } = useTheme();
  const isDark = theme === "dark";
  const palette = paletteFor(theme);

  return (
    <Pressable
      onPress={toggleTheme}
      disabled={transitioning}
      accessibilityRole="button"
      accessibilityLabel={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className={`flex-row items-center justify-center rounded-lg border border-border bg-card ${
        compact ? "h-11 w-11" : "gap-2 px-4 py-3"
      } ${transitioning ? "opacity-70" : ""} ${className}`}
    >
      <Ionicons
        name={isDark ? "sunny-outline" : "moon-outline"}
        size={compact ? 20 : 18}
        color={iconColor ?? palette.primary}
      />
      {!compact ? (
        <View className="flex-1">
          <Text className="text-sm font-medium text-foreground">
            {isDark ? "Modo claro" : "Modo escuro"}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {isDark ? "Tema escuro ativo" : "Tema claro ativo"}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
