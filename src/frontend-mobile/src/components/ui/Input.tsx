import { Text, TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & {
  label?: string;
};

export function Input({ label, ...props }: Props) {
  return (
    <View className="gap-y-2">
      {label ? (
        <Text className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor="#94a3b8"
        className="rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground"
        {...props}
      />
    </View>
  );
}
