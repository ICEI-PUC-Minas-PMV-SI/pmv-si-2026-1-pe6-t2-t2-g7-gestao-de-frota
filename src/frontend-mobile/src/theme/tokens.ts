import type { AppTheme } from "./themes";

/** Cores fixas para APIs que não usam classes Tailwind (ícones, tab bar RN). */
export const palettes = {
  light: {
    primary: "#1a237e",
    tabActive: "#1a237e",
    tabInactive: "#94a3b8",
    tabBar: "#ffffff",
    tabBarBorder: "#cbd5e1",
    headerBg: "#f8fafc",
    headerTitle: "#1e293b",
    sceneBg: "#f8fafc",
    spinner: "#1a237e",
  },
  dark: {
    primary: "#38bdf8",
    tabActive: "#38bdf8",
    tabInactive: "#94a3b8",
    tabBar: "#1e293b",
    tabBarBorder: "#475569",
    headerBg: "#0f172a",
    headerTitle: "#f1f5f9",
    sceneBg: "#0f172a",
    spinner: "#38bdf8",
  },
} as const;

export function paletteFor(theme: AppTheme) {
  return palettes[theme];
}

/** @deprecated Use paletteFor(theme) ou classes Tailwind semânticas. */
export const colors = palettes.light;

export const DEV_DISPLAY_NAME = "Operador";
