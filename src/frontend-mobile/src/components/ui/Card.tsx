import { View, ViewProps } from "react-native";
import { ReactNode } from "react";

type Props = ViewProps & { children: ReactNode };

export function Card({ children, className, ...rest }: Props & { className?: string }) {
  return (
    <View
      className={`rounded-xl border border-border bg-card p-5 ${className ?? ""}`}
      {...rest}
    >
      {children}
    </View>
  );
}
