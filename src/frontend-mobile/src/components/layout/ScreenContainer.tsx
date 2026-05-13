import { ReactNode } from "react";
import { SafeAreaView, View } from "react-native";

export function ScreenContainer({
  children,
  padded = true,
}: {
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className={`flex-1 ${padded ? "px-5 py-4" : ""}`}>{children}</View>
    </SafeAreaView>
  );
}
