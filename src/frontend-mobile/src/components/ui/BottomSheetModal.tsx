import { ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

type BottomSheetModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export function BottomSheetModal({
  open,
  onClose,
  title,
  description,
  children,
}: BottomSheetModalProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/45">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="max-h-[88%] rounded-t-[28px] border-t border-border bg-card px-5 pb-8 pt-4">
          <View className="mb-4 items-center">
            <View className="h-1.5 w-14 rounded-full bg-border" />
          </View>
          <View className="mb-5 flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">{title}</Text>
              {description ? (
                <Text className="mt-1 text-sm text-muted-foreground">
                  {description}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={onClose}
              className="rounded-full border border-border bg-background px-3 py-2"
            >
              <Text className="text-xs font-semibold uppercase text-muted-foreground">
                Fechar
              </Text>
            </Pressable>
          </View>
          <ScrollView
            className="flex-grow"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
