import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

const LOGO = require("../../../assets/images/unitech-logo-sem-fundo.png");

type Props = {
  size?: number;
  /** Fundo suave atrás do logo (hero escuro). */
  framed?: boolean;
};

export function UnitechLogo({ size = 56, framed = true }: Props) {
  if (!framed) {
    return (
      <Image
        source={LOGO}
        style={{ width: size, height: size }}
        contentFit="contain"
        accessibilityLabel="Logo Unitech"
      />
    );
  }

  return (
    <View style={[styles.frame, { width: size + 16, height: size + 16 }]}>
      <Image
        source={LOGO}
        style={{ width: size, height: size }}
        contentFit="contain"
        accessibilityLabel="Logo Unitech"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
