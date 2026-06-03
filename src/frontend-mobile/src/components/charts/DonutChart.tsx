import { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSubLabel?: string;
};

export function DonutChart({
  segments,
  size = 128,
  strokeWidth = 14,
  centerLabel,
  centerSubLabel,
}: Props) {
  const arcs = useMemo(() => {
    const sum = segments.reduce((acc, s) => acc + s.value, 0);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    return segments
      .filter((s) => s.value > 0)
      .map((s) => {
        const ratio = sum > 0 ? s.value / sum : 0;
        const length = ratio * circumference;
        const arc = {
          ...s,
          length,
          gap: circumference - length,
          offset,
        };
        offset -= length;
        return arc;
      });
  }, [segments, size, strokeWidth]);

  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View className="items-center justify-center">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="#cbd5e1"
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.35}
          />
          {arcs.map((arc) => (
            <Circle
              key={arc.label}
              cx={cx}
              cy={cy}
              r={radius}
              stroke={arc.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${arc.length} ${arc.gap}`}
              strokeDashoffset={arc.offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
        </Svg>
        <View
          className="absolute inset-0 items-center justify-center"
          pointerEvents="none"
        >
          {centerLabel ? (
            <Text className="text-xl font-semibold text-foreground">
              {centerLabel}
            </Text>
          ) : null}
          {centerSubLabel ? (
            <Text className="text-[10px] text-muted-foreground">
              {centerSubLabel}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
