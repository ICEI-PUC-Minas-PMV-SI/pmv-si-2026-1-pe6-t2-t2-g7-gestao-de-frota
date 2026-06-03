import { ReactNode } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  header?: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function AppScreen({
  children,
  header,
  scroll = true,
  padded = true,
  refreshing,
  onRefresh,
}: Props) {
  const insets = useSafeAreaInsets();
  const paddingClass = padded ? "px-5" : "";

  if (!scroll) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top }}
      >
        {header}
        <View className={`flex-1 ${paddingClass}`}>{children}</View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {header}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        <View className={`gap-y-6 py-5 ${paddingClass}`}>{children}</View>
      </ScrollView>
    </View>
  );
}
