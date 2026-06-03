import { Text, View } from "react-native";

/** Marcador de veículo (simulação), alinhado ao ícone 🚗 do frontend web. */
export function VehicleMapMarker() {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
      }}
    >
      <Text style={{ fontSize: 26, lineHeight: 28 }}>🚗</Text>
    </View>
  );
}
