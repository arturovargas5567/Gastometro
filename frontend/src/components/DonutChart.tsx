import React from "react";
import { View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

export interface PieSlice {
  value: number;
  color: string;
  label?: string;
}

interface Props {
  data: PieSlice[];
  size?: number;
  strokeWidth?: number;
  center?: React.ReactNode;
  backgroundColor?: string;
}

// Polar to cartesian
const polar = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const arcPath = (cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number) => {
  const startOuter = polar(cx, cy, rOuter, end);
  const endOuter = polar(cx, cy, rOuter, start);
  const startInner = polar(cx, cy, rInner, start);
  const endInner = polar(cx, cy, rInner, end);
  const largeArc = end - start <= 180 ? "0" : "1";
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
};

export const DonutChart: React.FC<Props> = ({
  data,
  size = 180,
  strokeWidth = 28,
  center,
  backgroundColor,
}) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 2;
  const rInner = rOuter - strokeWidth;

  let cursor = 0;
  const slices = data
    .filter((d) => d.value > 0)
    .map((d, i) => {
      const angle = (d.value / total) * 360;
      const start = cursor;
      const end = cursor + angle;
      cursor = end;
      return { ...d, start, end, key: `${i}-${d.color}` };
    });

  // If only one slice, draw as full circle
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        {backgroundColor && (
          <Circle cx={cx} cy={cy} r={rOuter} fill={backgroundColor} />
        )}
        {total === 0 ? (
          <Circle cx={cx} cy={cy} r={(rOuter + rInner) / 2} stroke="#E5E5EA" strokeWidth={strokeWidth} fill="none" />
        ) : (
          <G>
            {slices.length === 1 ? (
              <Circle
                cx={cx}
                cy={cy}
                r={(rOuter + rInner) / 2}
                stroke={slices[0].color}
                strokeWidth={strokeWidth}
                fill="none"
              />
            ) : (
              slices.map((s) => (
                <Path key={s.key} d={arcPath(cx, cy, rOuter, rInner, s.start, s.end)} fill={s.color} />
              ))
            )}
          </G>
        )}
      </Svg>
      {center && (
        <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>{center}</View>
      )}
    </View>
  );
};
