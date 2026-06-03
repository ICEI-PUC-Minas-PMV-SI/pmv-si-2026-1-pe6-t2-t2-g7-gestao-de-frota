import { useContext } from "react";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Respiro extra no fim das telas para a barra flutuante. */
export const FLOATING_TAB_BAR_EXTRA_INSET = 20;

const ESTIMATED_TAB_BAR_HEIGHT = 96;

export function useTabScreenBottomInset() {
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
  const insets = useSafeAreaInsets();

  const baseHeight =
    tabBarHeight > 0
      ? tabBarHeight
      : ESTIMATED_TAB_BAR_HEIGHT + Math.max(insets.bottom, 8);

  return baseHeight + FLOATING_TAB_BAR_EXTRA_INSET;
}
