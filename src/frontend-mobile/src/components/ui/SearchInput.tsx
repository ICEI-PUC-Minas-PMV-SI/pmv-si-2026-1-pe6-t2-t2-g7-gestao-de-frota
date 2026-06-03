import { TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Buscar...",
}: Props) {
  return (
    <View className="flex-row items-center rounded-xl border border-border bg-card px-3 py-2.5">
      <Ionicons name="search-outline" size={18} color="#94a3b8" />
      <TextInput
        className="ml-2 flex-1 text-sm text-foreground"
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
