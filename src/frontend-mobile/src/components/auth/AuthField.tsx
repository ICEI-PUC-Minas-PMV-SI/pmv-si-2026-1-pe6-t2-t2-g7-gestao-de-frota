import { Platform, Text, TextInput, TextInputProps, View } from "react-native";

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export function AuthField({ label, error, ...props }: AuthFieldProps) {
  return (
    <View className="gap-y-2">
      <Text className="text-[11px] font-medium uppercase tracking-[2px] text-muted-foreground">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#94a3b8"
        {...(Platform.OS === "web"
          ? ({ readOnly: false, "aria-disabled": false } as const)
          : {})}
        className={`rounded-2xl border bg-background px-4 py-3.5 text-base text-foreground ${
          error
            ? "border-red-500/60 bg-red-500/5"
            : "border-border"
        }`}
        {...props}
      />
      {error ? <Text className="text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}
