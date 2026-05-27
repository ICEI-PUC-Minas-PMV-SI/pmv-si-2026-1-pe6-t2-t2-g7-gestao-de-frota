import { Pressable, Text, View } from "react-native";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function OptionChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View className="gap-y-2">
      <Text className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              className={`rounded-full border px-3 py-1.5 ${
                active
                  ? "border-primary bg-primary"
                  : "border-border bg-card"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  active ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
