import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../src/context/auth.context";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#1a237e" />
      </View>
    );
  }

  return user ? <Redirect href="/(app)/homepage" /> : <Redirect href="/login" />;
}
