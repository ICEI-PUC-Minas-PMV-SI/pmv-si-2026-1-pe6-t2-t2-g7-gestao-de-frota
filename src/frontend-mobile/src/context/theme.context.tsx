import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  type AppTheme,
  THEME_STORAGE_KEY,
  themeVarsFor,
} from "../theme/themes";

const FADE_MS = 260;

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  ready: boolean;
  transitioning: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const AnimatedThemeRoot = Animated.createAnimatedComponent(View);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>("light");
  const [ready, setReady] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const themeRef = useRef(theme);
  const opacity = useSharedValue(1);
  const isAnimatingRef = useRef(false);

  themeRef.current = theme;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!cancelled && (stored === "dark" || stored === "light")) {
          setThemeState(stored);
          themeRef.current = stored;
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const finishTransition = useCallback(() => {
    isAnimatingRef.current = false;
    setTransitioning(false);
  }, []);

  const applyTheme = useCallback((next: AppTheme) => {
    setThemeState(next);
    themeRef.current = next;
    void AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
  }, []);

  const setTheme = useCallback(
    (next: AppTheme) => {
      if (next === themeRef.current || isAnimatingRef.current) return;

      isAnimatingRef.current = true;
      setTransitioning(true);

      opacity.value = withTiming(
        0,
        {
          duration: FADE_MS,
          easing: Easing.inOut(Easing.ease),
        },
        (finished) => {
          if (!finished) {
            runOnJS(finishTransition)();
            return;
          }

          runOnJS(applyTheme)(next);

          opacity.value = withTiming(
            1,
            {
              duration: FADE_MS,
              easing: Easing.inOut(Easing.ease),
            },
            (done) => {
              if (done) {
                runOnJS(finishTransition)();
              }
            },
          );
        },
      );
    },
    [applyTheme, finishTransition, opacity],
  );

  const toggleTheme = useCallback(() => {
    setTheme(themeRef.current === "dark" ? "light" : "dark");
  }, [setTheme]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, ready, transitioning }),
    [theme, setTheme, toggleTheme, ready, transitioning],
  );

  return (
    <ThemeContext.Provider value={value}>
      <AnimatedThemeRoot
        style={[themeVarsFor(theme), { flex: 1 }, animatedStyle]}
        className="flex-1 bg-background"
      >
        {children}
      </AnimatedThemeRoot>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider.");
  }
  return ctx;
}
