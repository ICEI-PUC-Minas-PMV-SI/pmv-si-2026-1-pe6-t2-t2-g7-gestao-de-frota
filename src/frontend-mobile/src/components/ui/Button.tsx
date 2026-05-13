import { ActivityIndicator, Pressable, Text } from "react-native";
import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "destructive" | "ghost";

type Props = {
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  children: ReactNode;
  leftIcon?: ReactNode;
};

const containerByVariant: Record<Variant, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  outline: "bg-card border border-border",
  destructive: "bg-destructive",
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
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-lg px-4 py-3 ${containerByVariant[variant]} ${isDisabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "destructive" ? "#f8fafc" : "#1a237e"} />
      ) : (
        <>
          {leftIcon}
          <Text className={`text-sm font-medium ${textByVariant[variant]} ${leftIcon ? "ml-2" : ""}`}>
            {children}
          </Text>
        </>
      )}
    </Pressable>
  );
}
