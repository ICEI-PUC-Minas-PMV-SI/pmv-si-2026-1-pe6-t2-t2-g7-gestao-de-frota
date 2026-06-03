import { useEffect, useState } from "react";
import type { TextInputProps } from "react-native";

import {
  formatCurrencyBrMask,
  numberToCurrencyBrMask,
  onlyDigits,
  parseCurrencyBrMaskToNumber,
} from "../../utils/inputMasks";
import { Input } from "./Input";

type Props = Omit<TextInputProps, "value" | "onChangeText" | "keyboardType"> & {
  label?: string;
  value?: number;
  onChangeValue: (value: number | undefined) => void;
};

export function CurrencyInput({
  label,
  value,
  onChangeValue,
  placeholder = "R$ 0,00",
  ...rest
}: Props) {
  const [display, setDisplay] = useState(() =>
    value != null ? numberToCurrencyBrMask(value) : "",
  );

  useEffect(() => {
    if (value != null) {
      setDisplay(numberToCurrencyBrMask(value));
    } else {
      setDisplay("");
    }
  }, [value]);

  function handleChange(text: string) {
    const digits = onlyDigits(text);
    const formatted = formatCurrencyBrMask(digits);
    setDisplay(formatted);
    onChangeValue(parseCurrencyBrMaskToNumber(formatted));
  }

  return (
    <Input
      label={label}
      value={display}
      onChangeText={handleChange}
      placeholder={placeholder}
      keyboardType="number-pad"
      {...rest}
    />
  );
}
