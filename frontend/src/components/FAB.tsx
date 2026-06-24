import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  bottom?: number;
}

export const FAB: React.FC<Props> = ({ bottom = 88 }) => {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <View style={[styles.wrap, { bottom }]} pointerEvents="box-none">
      <Pressable
        testID="add-expense-fab"
        onPress={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          router.push("/add-expense");
        }}
        style={({ pressed }) => [
          styles.btn,
          {
            backgroundColor: colors.brandPrimary,
            transform: [{ scale: pressed ? 0.94 : 1 }],
            shadowColor: colors.brandPrimary,
          },
        ]}
      >
        <Ionicons name="add" size={32} color={colors.onBrandPrimary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 20,
    alignItems: "flex-end",
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
});
