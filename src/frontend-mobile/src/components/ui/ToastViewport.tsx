import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../context/theme.context";
import type { AppTheme } from "../../theme/themes";
import { subscribeToast, ToastPayload } from "./toast";

const TOAST_DURATION = 4200;

type ToastTone = NonNullable<ToastPayload["tone"]>;

const TONE_ICONS: Record<ToastTone, keyof typeof Ionicons.glyphMap> = {
  error: "alert-circle-outline",
  success: "checkmark-circle-outline",
  info: "information-circle-outline",
};

const TONE_SURFACE: Record<
  AppTheme,
  Record<ToastTone, { bg: string; border: string; text: string; icon: string }>
> = {
  light: {
    error: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", icon: "#dc2626" },
    success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", icon: "#16a34a" },
    info: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", icon: "#2563eb" },
  },
  dark: {
    error: { bg: "#450a0a", border: "#7f1d1d", text: "#fecaca", icon: "#fca5a5" },
    success: { bg: "#052e16", border: "#166534", text: "#bbf7d0", icon: "#86efac" },
    info: { bg: "#172554", border: "#1e40af", text: "#bfdbfe", icon: "#93c5fd" },
  },
};

export function ToastViewport() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const [mounted, setMounted] = useState(false);
  const translateY = useRef(new Animated.Value(-24)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return subscribeToast((nextToast) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setMounted(true);
      setToast(nextToast);
      translateY.setValue(-24);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timeoutRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -16,
            duration: 200,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setToast(null);
          setMounted(false);
        });
      }, TOAST_DURATION);
    });
  }, [opacity, translateY]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!mounted || !toast) return null;

  const tone: ToastTone = toast.tone ?? "error";
  const surface = TONE_SURFACE[theme][tone];
  const topOffset = insets.top + (Platform.OS === "web" ? 16 : 12);

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={() => {}}
    >
      <View pointerEvents="none" style={styles.host}>
        <View style={[styles.anchor, { paddingTop: topOffset }]}>
          <Animated.View
            style={[
              styles.card,
              {
                opacity,
                transform: [{ translateY }],
                backgroundColor: surface.bg,
                borderColor: surface.border,
              },
              Platform.select({
                ios: {
                  shadowColor: "#0f172a",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: theme === "dark" ? 0.35 : 0.12,
                  shadowRadius: 12,
                },
                android: { elevation: 10 },
                default: {
                  boxShadow:
                    theme === "dark"
                      ? "0 4px 20px rgba(0, 0, 0, 0.45)"
                      : "0 4px 20px rgba(15, 23, 42, 0.14)",
                },
              }),
            ]}
          >
            <View style={styles.iconSlot}>
              <Ionicons
                name={TONE_ICONS[tone]}
                size={22}
                color={surface.icon}
              />
            </View>
            <Text
              style={[styles.message, { color: surface.text }]}
              accessibilityRole="alert"
            >
              {toast.message}
            </Text>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    backgroundColor: "transparent",
  },
  anchor: {
    paddingHorizontal: 16,
    width: "100%",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconSlot: {
    width: 28,
    marginRight: 10,
    alignItems: "center",
    paddingTop: 1,
  },
  message: {
    flex: 1,
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
});
