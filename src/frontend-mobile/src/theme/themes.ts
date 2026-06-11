import { vars } from "nativewind";

export type AppTheme = "light" | "dark";

/** Mesma chave do frontend web (`AppShell`). */
export const THEME_STORAGE_KEY = "unitech-theme";

/** Variáveis CSS (RGB) para NativeWind — alinhadas a `globals.css` do web. */
export const lightThemeVars = vars({
  "--color-background": "248 250 252",
  "--color-foreground": "30 41 59",
  "--color-card": "255 255 255",
  "--color-card-foreground": "30 41 59",
  "--color-primary": "26 35 126",
  "--color-primary-foreground": "248 250 252",
  "--color-muted": "226 232 240",
  "--color-muted-foreground": "71 85 105",
  "--color-accent": "219 234 254",
  "--color-accent-foreground": "26 35 126",
  "--color-destructive": "220 38 38",
  "--color-destructive-foreground": "248 250 252",
  "--color-tone-success-bg": "220 252 231",
  "--color-tone-success-fg": "22 101 52",
  "--color-tone-warning-bg": "254 243 199",
  "--color-tone-warning-fg": "146 64 14",
  "--color-tone-danger-bg": "254 226 226",
  "--color-tone-danger-fg": "153 27 27",
  "--color-border": "203 213 225",
  "--color-input": "226 232 240",
  "--color-ring": "56 189 248",
  "--color-tab-bar": "255 255 255",
  "--color-tab-inactive": "148 163 184",
  "--color-tab-active": "26 35 126",
  "--color-toast-error-bg": "254 242 242",
  "--color-toast-error-border": "254 202 202",
  "--color-toast-error-text": "153 27 27",
  "--color-toast-success-bg": "240 253 244",
  "--color-toast-success-border": "187 247 208",
  "--color-toast-success-text": "22 101 52",
  "--color-toast-info-bg": "239 246 255",
  "--color-toast-info-border": "191 219 254",
  "--color-toast-info-text": "30 64 175",
});

export const darkThemeVars = vars({
  "--color-background": "15 23 42",
  "--color-foreground": "241 245 249",
  "--color-card": "30 41 59",
  "--color-card-foreground": "241 245 249",
  "--color-primary": "56 189 248",
  "--color-primary-foreground": "15 23 42",
  "--color-muted": "51 65 85",
  "--color-muted-foreground": "203 213 225",
  "--color-accent": "51 65 85",
  "--color-accent-foreground": "241 245 249",
  "--color-destructive": "248 113 113",
  "--color-destructive-foreground": "15 23 42",
  "--color-tone-success-bg": "20 83 45",
  "--color-tone-success-fg": "134 239 172",
  "--color-tone-warning-bg": "66 32 6",
  "--color-tone-warning-fg": "252 211 77",
  "--color-tone-danger-bg": "69 10 10",
  "--color-tone-danger-fg": "252 165 165",
  "--color-border": "71 85 105",
  "--color-input": "51 65 85",
  "--color-ring": "56 189 248",
  "--color-tab-bar": "30 41 59",
  "--color-tab-inactive": "148 163 184",
  "--color-tab-active": "56 189 248",
  "--color-toast-error-bg": "69 10 10",
  "--color-toast-error-border": "127 29 29",
  "--color-toast-error-text": "254 202 202",
  "--color-toast-success-bg": "5 46 22",
  "--color-toast-success-border": "22 101 52",
  "--color-toast-success-text": "187 247 208",
  "--color-toast-info-bg": "23 37 84",
  "--color-toast-info-border": "30 64 175",
  "--color-toast-info-text": "191 219 254",
});

export function themeVarsFor(theme: AppTheme) {
  return theme === "dark" ? darkThemeVars : lightThemeVars;
}
