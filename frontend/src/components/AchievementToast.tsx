import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../store/AppStore";
import { ACHIEVEMENTS } from "../constants/achievements";
import { useTheme } from "../theme/ThemeContext";

export const AchievementToast: React.FC = () => {
  const { newlyUnlocked, clearNewlyUnlocked } = useAppStore();
  const { colors, spacing, radius } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    if (newlyUnlocked.length === 0) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -30, duration: 200, useNativeDriver: true }),
      ]).start(() => clearNewlyUnlocked());
    }, 2800);
    return () => clearTimeout(t);
  }, [newlyUnlocked, opacity, translateY, clearNewlyUnlocked]);

  if (newlyUnlocked.length === 0) return null;
  const id = newlyUnlocked[0];
  const ach = ACHIEVEMENTS.find((a) => a.id === id);
  if (!ach) return null;

  return (
    <Animated.View
      testID="achievement-toast"
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surfaceSecondary,
          borderRadius: radius.lg,
          borderColor: colors.border,
          padding: spacing.md,
          opacity,
          transform: [{ translateY }],
          shadowColor: "#000",
        },
      ]}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: ach.color + "22",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={ach.icon} size={24} color={ach.color} />
      </View>
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={{ color: colors.onSurfaceTertiary, fontSize: 11, fontWeight: "600" }}>
          ¡Logro desbloqueado!
        </Text>
        <Text style={{ color: colors.onSurface, fontSize: 15, fontWeight: "700" }}>{ach.title}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 56,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 100,
  },
});
