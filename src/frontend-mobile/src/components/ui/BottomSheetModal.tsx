import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedBottomSheetShell } from "./AnimatedBottomSheetShell";

const SHEET_MAX_HEIGHT = Dimensions.get("window").height * 0.9;

type BottomSheetModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export function BottomSheetModal({
  open,
  onClose,
  title,
  description,
  children,
}: BottomSheetModalProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 16);
  const scrollMaxHeight = SHEET_MAX_HEIGHT - bottomPad - 160;

  return (
    <AnimatedBottomSheetShell open={open} onClose={onClose}>
      <View
        className="w-full rounded-t-[28px] border-t border-border bg-card"
        style={[
          styles.sheet,
          {
            maxHeight: SHEET_MAX_HEIGHT,
            paddingBottom: bottomPad,
          },
        ]}
      >
        <View style={styles.handleWrap}>
          <View className="h-1.5 w-14 rounded-full bg-border" />
        </View>
        <View style={styles.header}>
          <View className="min-w-0 flex-1">
            <Text className="text-lg font-semibold text-foreground">{title}</Text>
            {description ? (
              <Text className="mt-1 text-sm text-muted-foreground">
                {description}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={onClose}
            className="rounded-full border border-border bg-background px-3 py-2"
          >
            <Text className="text-xs font-semibold uppercase text-muted-foreground">
              Fechar
            </Text>
          </Pressable>
        </View>
        <ScrollView
          style={[styles.scroll, { maxHeight: Math.max(scrollMaxHeight, 160) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          bounces
          nestedScrollEnabled
        >
          {children}
        </ScrollView>
      </View>
    </AnimatedBottomSheetShell>
  );
}

const styles = StyleSheet.create({
  sheet: {
    width: "100%",
    flexDirection: "column",
    overflow: "hidden",
  },
  handleWrap: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
    flexShrink: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    flexShrink: 0,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
    paddingHorizontal: 20,
  },
});
