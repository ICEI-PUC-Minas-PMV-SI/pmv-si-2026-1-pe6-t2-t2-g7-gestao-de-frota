import { ActivityIndicator, Text, View } from "react-native";

import { useTheme } from "../../context/theme.context";
import { paletteFor } from "../../theme/tokens";

export function ScreenLoader({ message }: { message?: string }) {
  const { theme } = useTheme();
  const palette = paletteFor(theme);

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <ActivityIndicator color={palette.spinner} size="large" />
      {message ? (
        <Text className="mt-3 text-center text-sm text-muted-foreground">
          {message}
        </Text>
      ) : null}
    </View>
  );
}
