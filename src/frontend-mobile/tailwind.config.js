/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--color-card) / <alpha-value>)",
          foreground: "rgb(var(--color-card-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "rgb(var(--color-primary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--color-muted) / <alpha-value>)",
          foreground: "rgb(var(--color-muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          foreground: "rgb(var(--color-accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--color-destructive) / <alpha-value>)",
          foreground: "rgb(var(--color-destructive-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--color-border) / <alpha-value>)",
        input: "rgb(var(--color-input) / <alpha-value>)",
        ring: "rgb(var(--color-ring) / <alpha-value>)",
        success: "#16a34a",
        warning: "#ca8a04",
        tone: {
          success: {
            bg: "rgb(var(--color-tone-success-bg) / <alpha-value>)",
            fg: "rgb(var(--color-tone-success-fg) / <alpha-value>)",
          },
          warning: {
            bg: "rgb(var(--color-tone-warning-bg) / <alpha-value>)",
            fg: "rgb(var(--color-tone-warning-fg) / <alpha-value>)",
          },
          danger: {
            bg: "rgb(var(--color-tone-danger-bg) / <alpha-value>)",
            fg: "rgb(var(--color-tone-danger-fg) / <alpha-value>)",
          },
        },
        tab: {
          bar: "rgb(var(--color-tab-bar) / <alpha-value>)",
          active: "rgb(var(--color-tab-active) / <alpha-value>)",
          inactive: "rgb(var(--color-tab-inactive) / <alpha-value>)",
        },
        toast: {
          error: {
            bg: "rgb(var(--color-toast-error-bg) / <alpha-value>)",
            border: "rgb(var(--color-toast-error-border) / <alpha-value>)",
            text: "rgb(var(--color-toast-error-text) / <alpha-value>)",
          },
          success: {
            bg: "rgb(var(--color-toast-success-bg) / <alpha-value>)",
            border: "rgb(var(--color-toast-success-border) / <alpha-value>)",
            text: "rgb(var(--color-toast-success-text) / <alpha-value>)",
          },
          info: {
            bg: "rgb(var(--color-toast-info-bg) / <alpha-value>)",
            border: "rgb(var(--color-toast-info-border) / <alpha-value>)",
            text: "rgb(var(--color-toast-info-text) / <alpha-value>)",
          },
        },
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "14px",
        "2xl": "16px",
      },
      fontFamily: {
        sans: ["Inter_400Regular", "System"],
        medium: ["Inter_500Medium", "System"],
        semibold: ["Inter_600SemiBold", "System"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(15 23 42 / 0.06)",
        tab: "0 -4px 24px -4px rgb(15 23 42 / 0.08)",
      },
    },
  },
  plugins: [],
};
