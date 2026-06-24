import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  progress: number; // 0..1+
  height?: number;
  color?: string;
  trackColor?: string;
  testID?: string;
}

export const ProgressBar: React.FC<Props> = ({ progress, height = 10, color, trackColor, testID }) => {
  const { colors, radius } = useTheme();
  const safe = Math.max(0, Math.min(1, progress));
  let barColor = color ?? colors.brandPrimary;
  if (!color) {
    if (progress >= 1) barColor = colors.error;
    else if (progress >= 0.8) barColor = colors.warning;
    else barColor = colors.success;
  }
  return (
    <View
      testID={testID}
      style={[
        styles.track,
        { height, borderRadius: radius.pill, backgroundColor: trackColor ?? colors.surfaceTertiary },
      ]}
    >
      <View
        style={{
          height: "100%",
          width: `${safe * 100}%`,
          borderRadius: radius.pill,
          backgroundColor: barColor,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
});
