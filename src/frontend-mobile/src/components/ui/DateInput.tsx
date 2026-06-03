import type { TextInputProps } from "react-native";

import { formatDateBrMask, onlyDigits } from "../../utils/inputMasks";
import { Input } from "./Input";

type Props = Omit<TextInputProps, "value" | "onChangeText" | "keyboardType"> & {
  label?: string;
  /** Valor exibido DD/MM/AAAA. */
  value: string;
  onChangeValue: (display: string) => void;
};

export function DateInput({
  label,
  value,
  onChangeValue,
  placeholder = "DD/MM/AAAA",
  ...rest
}: Props) {
  function handleChange(text: string) {
    onChangeValue(formatDateBrMask(onlyDigits(text, 8)));
  }

  return (
    <Input
      label={label}
      value={value}
      onChangeText={handleChange}
      placeholder={placeholder}
      keyboardType="number-pad"
      maxLength={10}
      {...rest}
    />
  );
}
