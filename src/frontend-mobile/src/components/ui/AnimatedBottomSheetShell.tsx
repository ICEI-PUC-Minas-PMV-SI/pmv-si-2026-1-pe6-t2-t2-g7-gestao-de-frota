import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

import { useTheme } from "../../context/theme.context";
import { themeVarsFor } from "../../theme/themes";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Conteúdo fixo no modal (ex.: toast), fora do painel deslizante. */
  overlaySlot?: ReactNode;
};

/**
 * Overlay com fade + painel ancorado na base com slide (animações independentes).
 */
export function AnimatedBottomSheetShell({
  open,
  onClose,
  children,
  overlaySlot,
}: Props) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(open);
  const sheetOffset = useRef(Dimensions.get("window").height).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(sheetOffset)).current;

  useEffect(() => {
    if (open) {
      setMounted(true);
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(sheetOffset);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!mounted) return;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: sheetOffset,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [open, mounted, backdropOpacity, sheetTranslateY, sheetOffset]);

  if (!mounted) return null;

  const themeRootStyle = [
    styles.root,
    themeVarsFor(theme) as ViewStyle,
  ];

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={themeRootStyle}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            styles.backdrop,
            { opacity: backdropOpacity },
          ]}
        />
        <Pressable
          style={[StyleSheet.absoluteFillObject, styles.dismissArea]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        />
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.sheet,
            { transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          {children}
        </Animated.View>
        {overlaySlot ? (
          <View style={styles.overlaySlot} pointerEvents="box-none">
            {overlaySlot}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  dismissArea: {
    zIndex: 1,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    width: "100%",
  },
  overlaySlot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
});
