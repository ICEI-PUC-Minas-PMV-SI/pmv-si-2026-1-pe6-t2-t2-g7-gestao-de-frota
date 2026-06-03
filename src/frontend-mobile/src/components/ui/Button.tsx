import { ActivityIndicator, Pressable, Text, type ViewStyle } from "react-native";
import { ReactNode } from "react";

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
  secondary: "bg-secondary border border-secondary",
  outline: "bg-card border border-border",
  destructive: "bg-destructive border border-destructive",
  ghost: "bg-transparent",
};

const textByVariant: Record<Variant, string> = {
  primary: "text-primary-foreground",
  secondary: "text-secondary-foreground",
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
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={style}
      className={`min-h-[48px] flex-row items-center justify-center rounded-xl px-4 py-3 ${containerByVariant[variant]} ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "destructive" ? "#f8fafc" : "#1a237e"} />
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
