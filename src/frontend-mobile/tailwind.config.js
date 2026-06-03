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
        background: "#f8fafc",
        foreground: "#1e293b",
        card: "#ffffff",
        "card-foreground": "#1e293b",
        popover: "#ffffff",
        "popover-foreground": "#1e293b",
        primary: "#1a237e",
        "primary-foreground": "#f8fafc",
        secondary: "#e2e8f0",
        "secondary-foreground": "#1e293b",
        muted: "#e2e8f0",
        "muted-foreground": "#475569",
        accent: "#dbeafe",
        "accent-foreground": "#1a237e",
        destructive: "#dc2626",
        "destructive-foreground": "#f8fafc",
        border: "#cbd5e1",
        input: "#e2e8f0",
        ring: "#38bdf8",
        success: "#16a34a",
        warning: "#ca8a04",
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
