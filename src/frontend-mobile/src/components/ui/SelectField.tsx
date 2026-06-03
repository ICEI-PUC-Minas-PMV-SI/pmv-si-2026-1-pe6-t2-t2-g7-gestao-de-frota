import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../context/theme.context";
import { surfaceFor } from "../../theme/surfaceColors";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
};

const OPTIONS_LIST_MAX_HEIGHT = 220;

/**
 * Select com lista expansível inline (evita Modal aninhado dentro de FormSheet na web).
 */
export function SelectField<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção",
  disabled = false,
}: Props<T>) {
  const { theme } = useTheme();
  const colors = surfaceFor(theme);
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => opt.value === value);
  const isDisabled = disabled || options.length === 0;

  function toggle() {
    if (isDisabled) return;
    setOpen((prev) => !prev);
  }

  function select(next: T) {
    onChange(next);
    setOpen(false);
  }

  return (
    <View className="gap-y-2">
      <Text className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Pressable
        disabled={isDisabled}
        onPress={toggle}
        className={`min-h-[52px] flex-row items-center justify-between rounded-2xl border border-border bg-background px-4 py-3.5 ${
          isDisabled ? "opacity-60" : ""
        }`}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Abre a lista de opções"
        accessibilityState={{ expanded: open }}
      >
        <Text
          className={`flex-1 pr-2 text-base ${
            selected ? "text-foreground" : "text-muted-foreground"
          }`}
          numberOfLines={2}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.mutedForeground}
        />
      </Pressable>

      {open ? (
        <View
          style={[
            styles.panel,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <ScrollView
            style={styles.list}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={options.length > 4}
          >
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => select(opt.value)}
                  style={[
                    styles.option,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.accent : colors.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color: active ? colors.primary : colors.foreground,
                        fontWeight: active ? "600" : "400",
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {opt.label}
                  </Text>
                  {active ? (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 8,
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
  },
  list: {
    maxHeight: OPTIONS_LIST_MAX_HEIGHT,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 8,
    marginVertical: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionLabel: {
    flex: 1,
    paddingRight: 8,
    fontSize: 14,
  },
});
