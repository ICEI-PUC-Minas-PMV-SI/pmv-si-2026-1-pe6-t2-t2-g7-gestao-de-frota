import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReactNode } from "react";

type Props = {
  visible: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function FormSheet({
  visible,
  title,
  description,
  onClose,
  children,
  footer,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/45" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="max-h-[92%] rounded-t-2xl bg-background"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="items-center py-2">
            <View className="h-1 w-10 rounded-full bg-border" />
          </View>
          <View className="flex-row items-start justify-between px-5 pb-3">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-semibold text-foreground">{title}</Text>
              {description ? (
                <Text className="mt-1 text-sm text-muted-foreground">
                  {description}
                </Text>
              ) : null}
            </View>
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Fechar">
              <Ionicons name="close" size={24} color="#64748b" />
            </Pressable>
          </View>
          <ScrollView
            className="px-5"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          {footer ? <View className="px-5 pt-4">{footer}</View> : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
