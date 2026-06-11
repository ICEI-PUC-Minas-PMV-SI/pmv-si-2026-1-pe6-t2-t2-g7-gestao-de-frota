import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../src/context/auth.context";
import { useTheme } from "../src/context/theme.context";
import { paletteFor } from "../src/theme/tokens";

export default function Index() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const palette = paletteFor(theme);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={palette.spinner} />
      </View>
    );
  }

  return user ? <Redirect href="/(app)/dashboard" /> : <Redirect href="/login" />;
}
