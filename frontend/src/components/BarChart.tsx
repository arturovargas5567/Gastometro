import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface Bar {
  label: string;
  value: number;
  color?: string;
  emphasize?: boolean;
}

interface Props {
  data: Bar[];
  maxValue?: number;
  height?: number;
  showValues?: boolean;
  valueFormatter?: (n: number) => string;
}

export const BarChart: React.FC<Props> = ({ data, maxValue, height = 140, showValues, valueFormatter }) => {
  const { colors, radius, spacing } = useTheme();
  const max = maxValue ?? Math.max(1, ...data.map((d) => d.value));

  return (
    <View style={{ width: "100%" }}>
      <View style={[styles.row, { height, alignItems: "flex-end" }]}>
        {data.map((b, idx) => {
          const ratio = b.value > 0 ? b.value / max : 0;
          const barH = Math.max(2, ratio * (height - 28));
          const barColor = b.color ?? (b.emphasize ? colors.brandPrimary : colors.brandTertiary);
          return (
            <View key={idx} style={[styles.col, { gap: 4 }]}>
              {showValues && b.value > 0 && (
                <Text style={[styles.value, { color: colors.onSurfaceTertiary }]} numberOfLines={1}>
                  {valueFormatter ? valueFormatter(b.value) : b.value.toFixed(0)}
                </Text>
              )}
              <View
                style={{
                  width: "70%",
                  height: barH,
                  borderRadius: radius.sm,
                  backgroundColor: barColor,
                }}
              />
            </View>
          );
        })}
      </View>
      <View style={[styles.row, { marginTop: spacing.xs }]}>
        {data.map((b, idx) => (
          <View key={idx} style={styles.col}>
            <Text style={[styles.label, { color: colors.onSurfaceTertiary }]} numberOfLines={1}>
              {b.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", width: "100%" },
  col: { flex: 1, alignItems: "center" },
  label: { fontSize: 11, fontWeight: "500" },
  value: { fontSize: 10, fontWeight: "600" },
});
