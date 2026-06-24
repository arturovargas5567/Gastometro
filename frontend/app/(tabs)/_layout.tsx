import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "@/src/theme/ThemeContext";

export default function TabsLayout() {
  const { colors, mode } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.onSurfaceTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          backgroundColor: Platform.OS === "android" ? colors.surfaceSecondary : "transparent",
          elevation: 0,
          height: Platform.OS === "ios" ? 84 : 70,
          paddingTop: 6,
        },
        tabBarBackground:
          Platform.OS === "ios"
            ? () => (
                <BlurView
                  intensity={70}
                  tint={mode === "dark" ? "dark" : "light"}
                  style={StyleSheet.absoluteFill}
                />
              )
            : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          tabBarTestID: "tab-home",
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Estadísticas",
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
          tabBarTestID: "tab-stats",
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Objetivos",
          tabBarIcon: ({ color, size }) => <Ionicons name="flag" size={size} color={color} />,
          tabBarTestID: "tab-goals",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
          tabBarTestID: "tab-settings",
        }}
      />
    </Tabs>
  );
}

const _styles = StyleSheet.create({
  spacer: { width: 0 },
});

void View;
