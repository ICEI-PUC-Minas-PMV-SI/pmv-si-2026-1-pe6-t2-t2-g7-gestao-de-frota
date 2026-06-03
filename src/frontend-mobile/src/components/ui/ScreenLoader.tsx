import { ActivityIndicator, Text, View } from "react-native";

import { colors } from "../../theme/tokens";

export function ScreenLoader({ message }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <ActivityIndicator color={colors.primary} size="large" />
      {message ? (
        <Text className="mt-3 text-center text-sm text-muted-foreground">
          {message}
        </Text>
      ) : null}
    </View>
  );
}
