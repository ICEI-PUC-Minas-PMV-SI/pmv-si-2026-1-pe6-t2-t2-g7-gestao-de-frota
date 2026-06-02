import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";

import { subscribeToast, ToastPayload } from "./toast";

const TOAST_DURATION = 3200;

export function ToastViewport() {
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const translateY = useRef(new Animated.Value(32)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return subscribeToast((nextToast) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast(nextToast);
      translateY.setValue(32);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      timeoutRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 20,
            duration: 180,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 160,
            useNativeDriver: true,
          }),
        ]).start(() => setToast(null));
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

  if (!toast) return null;

  const toneClassName =
    toast.tone === "success"
      ? "border-emerald-500/20 bg-emerald-950"
      : toast.tone === "info"
        ? "border-sky-500/20 bg-sky-950"
        : "border-rose-500/20 bg-slate-950";

  return (
    <View className="pointer-events-none absolute bottom-5 left-0 right-0 z-50 items-center px-4">
      <Animated.View
        style={{ opacity, transform: [{ translateY }] }}
        className={`w-full max-w-[420px] rounded-2xl border px-4 py-3 shadow-lg ${toneClassName}`}
      >
        <Text className="text-sm font-medium text-white">{toast.message}</Text>
      </Animated.View>
    </View>
  );
}
