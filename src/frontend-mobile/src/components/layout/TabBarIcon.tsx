import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  name: keyof typeof Ionicons.glyphMap;
  nameFocused: keyof typeof Ionicons.glyphMap;
  color: string;
  focused?: boolean;
  size?: number;
};

/** Evita corte do ícone na tab bar (altura fixa + overflow visível). */
export function TabBarIcon({
  name,
  nameFocused,
  color,
  focused,
  size = 22,
}: Props) {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      }}
    >
      <Ionicons
        name={focused ? nameFocused : name}
        size={size}
        color={color}
      />
    </View>
  );
}
