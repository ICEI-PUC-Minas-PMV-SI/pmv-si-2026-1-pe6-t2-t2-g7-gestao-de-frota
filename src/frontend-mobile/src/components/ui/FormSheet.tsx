import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReactNode } from "react";

import { useTheme } from "../../context/theme.context";
import { surfaceFor } from "../../theme/surfaceColors";
import { AnimatedBottomSheetShell } from "./AnimatedBottomSheetShell";

const SHEET_MAX_HEIGHT = Dimensions.get("window").height * 0.9;

type Props = {
  visible: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function FormSheet({
  visible,
  title,
  description,
  onClose,
  children,
  footer,
}: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 16);
  /** Cabeçalho + handle + rodapé opcional — área rolável recebe o restante até 90% da tela. */
  const scrollMaxHeight =
    SHEET_MAX_HEIGHT - bottomPad - (footer ? 200 : 140);

  return (
    <AnimatedBottomSheetShell open={visible} onClose={onClose}>
      <View
        className="w-full rounded-t-2xl bg-background"
        style={[
          styles.sheet,
          {
            maxHeight: SHEET_MAX_HEIGHT,
            paddingBottom: bottomPad,
          },
        ]}
      >
        <View style={styles.handleWrap}>
          <View className="h-1 w-10 rounded-full bg-border" />
        </View>
        <View style={styles.header}>
          <View className="min-w-0 flex-1 pr-4">
            <Text className="text-lg font-semibold text-foreground">{title}</Text>
            {description ? (
              <Text className="mt-1 text-sm text-muted-foreground">
                {description}
              </Text>
            ) : null}
          </View>
          <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Fechar">
            <Ionicons name="close" size={24} color={surfaceFor(theme).mutedForeground} />
          </Pressable>
        </View>
        <ScrollView
          style={[styles.scroll, { maxHeight: Math.max(scrollMaxHeight, 160) }]}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          bounces
          nestedScrollEnabled
        >
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
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
    paddingTop: 8,
    paddingBottom: 4,
    flexShrink: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexShrink: 0,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexShrink: 0,
  },
});
