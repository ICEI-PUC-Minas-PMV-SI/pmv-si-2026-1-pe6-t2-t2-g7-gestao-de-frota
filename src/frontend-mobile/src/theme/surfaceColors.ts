import type { AppTheme } from "./themes";

/** Cores sólidas para StyleSheet (modais/portais fora do NativeWind na web). */
export const surfaceColors = {
  light: {
    background: "#f8fafc",
    card: "#ffffff",
    foreground: "#1e293b",
    mutedForeground: "#64748b",
    primary: "#1a237e",
    primaryForeground: "#f8fafc",
    border: "#cbd5e1",
    destructive: "#dc2626",
    destructiveForeground: "#ffffff",
    success: "#16a34a",
    successBg: "#dcfce7",
    accent: "#dbeafe",
  },
  dark: {
    background: "#0f172a",
    card: "#1e293b",
    foreground: "#f1f5f9",
    mutedForeground: "#cbd5e1",
    primary: "#38bdf8",
    primaryForeground: "#0f172a",
    border: "#475569",
    destructive: "#f87171",
    destructiveForeground: "#0f172a",
    success: "#4ade80",
    successBg: "#14532d",
    accent: "#334155",
  },
} as const;

export type SurfaceColors = (typeof surfaceColors)[AppTheme];

export function surfaceFor(theme: AppTheme): SurfaceColors {
  return surfaceColors[theme];
}
