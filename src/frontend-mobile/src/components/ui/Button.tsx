import { ActivityIndicator, Pressable, Text, type ViewStyle } from "react-native";
import { ReactNode } from "react";

import { useTheme } from "../../context/theme.context";
import { surfaceFor } from "../../theme/surfaceColors";

type Variant = "primary" | "secondary" | "outline" | "destructive" | "ghost";

type Props = {
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  children: ReactNode;
  leftIcon?: ReactNode;
  style?: ViewStyle;
  className?: string;
};

const containerByVariant: Record<Variant, string> = {
  primary: "bg-primary border border-primary",
  secondary: "bg-muted border border-border",
  outline: "bg-card border border-border",
  destructive: "bg-destructive border border-destructive",
  ghost: "bg-transparent",
};

const textByVariant: Record<Variant, string> = {
  primary: "text-primary-foreground",
  secondary: "text-foreground",
  outline: "text-foreground",
  destructive: "text-destructive-foreground",
  ghost: "text-primary",
};

export function Button({
  onPress,
  disabled,
  loading,
  variant = "primary",
  children,
  leftIcon,
  style,
  className,
}: Props) {
  const { theme } = useTheme();
  const surface = surfaceFor(theme);
  const isDisabled = disabled || loading;
  const spinnerColor =
    variant === "primary" || variant === "destructive"
      ? surface.primaryForeground
      : surface.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={style}
      className={`min-h-[48px] flex-row items-center justify-center rounded-xl px-4 py-3 ${containerByVariant[variant]} ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <>
          {leftIcon}
          <Text className={`text-sm font-semibold ${textByVariant[variant]} ${leftIcon ? "ml-2" : ""}`}>
            {children}
          </Text>
        </>
      )}
    </Pressable>
  );
}
