import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryBadge } from "@/src/components/CategoryBadge";
import { FAB } from "@/src/components/FAB";
import { ProgressBar } from "@/src/components/ProgressBar";
import { CATEGORY_MAP } from "@/src/constants/categories";
import { expenseHelpers, useAppStore } from "@/src/store/AppStore";
import { useTheme } from "@/src/theme/ThemeContext";
import { MONTHS_ES, formatDateLong, formatMoney, groupByDate } from "@/src/utils/format";

export default function HomeScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { expenses, settings, streak } = useAppStore();
  const router = useRouter();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthExpenses = useMemo(
    () => expenseHelpers.filterMonth(expenses, year, month),
    [expenses, year, month]
  );

  const totalMonth = useMemo(
    () => monthExpenses.reduce((s, e) => s + e.amount, 0),
    [monthExpenses]
  );

  const budget = settings.monthlyBudget;
  const remaining = budget ? budget - totalMonth : 0;
  const ratio = budget ? totalMonth / budget : 0;

  const recent = useMemo(() => groupByDate(monthExpenses).slice(0, 6), [monthExpenses]);

  let progressColor = colors.success;
  if (ratio >= 1) progressColor = colors.error;
  else if (ratio >= 0.8) progressColor = colors.warning;
  else progressColor = colors.brandPrimary;

  const heroGradient: [string, string] =
    ratio >= 1
      ? [colors.error, "#FF6B6B"]
      : ratio >= 0.8
      ? [colors.warning, "#FFB84D"]
      : [colors.brandPrimary, colors.brandSecondary];

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: 160,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
          <Text style={{ color: colors.onSurfaceTertiary, fontSize: 13, fontWeight: "600" }}>
            {MONTHS_ES[month]} {year}
          </Text>
          <Text
            testID="home-title"
            style={{ color: colors.onSurface, fontSize: 28, fontWeight: "800", marginTop: 2 }}
          >
            Hola 👋
          </Text>
        </View>

        {/* Hero Card */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <LinearGradient
            colors={heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { borderRadius: radius.lg, padding: spacing.xl }]}
          >
            <Text style={styles.heroLabel}>Gasto este mes</Text>
            <Text testID="hero-total" style={styles.heroAmount}>
              {formatMoney(totalMonth, settings.currency)}
            </Text>

            {budget ? (
              <>
                <View style={{ marginTop: spacing.lg }}>
                  <ProgressBar
                    progress={ratio}
                    color="rgba(255,255,255,0.95)"
                    trackColor="rgba(255,255,255,0.25)"
                    height={8}
                    testID="hero-progress"
                  />
                </View>
                <View style={[styles.heroRow, { marginTop: spacing.md }]}>
                  <View>
                    <Text style={styles.heroSmallLabel}>Presupuesto</Text>
                    <Text style={styles.heroSmallValue}>
                      {formatMoney(budget, settings.currency)}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.heroSmallLabel}>
                      {remaining >= 0 ? "Disponible" : "Excedido"}
                    </Text>
                    <Text style={styles.heroSmallValue} testID="hero-remaining">
                      {formatMoney(Math.abs(remaining), settings.currency)}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.heroSmallLabel}>Consumido</Text>
                    <Text style={styles.heroSmallValue}>
                      {Math.round(ratio * 100)}%
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <Pressable
                testID="set-budget-cta"
                onPress={() => router.push("/(tabs)/settings")}
                style={[styles.heroSetBudget, { marginTop: spacing.lg }]}
              >
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.heroSetBudgetText}>Fijar presupuesto mensual</Text>
              </Pressable>
            )}
          </LinearGradient>
        </View>

        {/* Quick stats strip */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: spacing.lg,
            marginTop: spacing.lg,
            gap: spacing.md,
          }}
        >
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderRadius: radius.md },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="flame" size={16} color={colors.warning} />
              <Text style={{ color: colors.onSurfaceTertiary, fontSize: 12, fontWeight: "600" }}>
                Racha
              </Text>
            </View>
            <Text
              testID="stat-streak"
              style={{ color: colors.onSurface, fontSize: 22, fontWeight: "800", marginTop: 4 }}
            >
              {streak.count}
              <Text style={{ fontSize: 13, color: colors.onSurfaceTertiary, fontWeight: "600" }}> días</Text>
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderRadius: radius.md },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="receipt" size={16} color={colors.brandPrimary} />
              <Text style={{ color: colors.onSurfaceTertiary, fontSize: 12, fontWeight: "600" }}>
                Gastos
              </Text>
            </View>
            <Text
              testID="stat-count"
              style={{ color: colors.onSurface, fontSize: 22, fontWeight: "800", marginTop: 4 }}
            >
              {monthExpenses.length}
              <Text style={{ fontSize: 13, color: colors.onSurfaceTertiary, fontWeight: "600" }}> este mes</Text>
            </Text>
          </View>
        </View>

        {/* Recent expenses */}
        <View style={{ marginTop: spacing.xl, paddingHorizontal: spacing.lg }}>
          <View style={[styles.sectionHead]}>
            <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "700" }}>
              Movimientos recientes
            </Text>
          </View>

          {monthExpenses.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.xl,
                },
              ]}
              testID="home-empty"
            >
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1614260938313-a7fc1a7ad0d2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMHdhbGxldCUyMG1pbmltYWxpc3QlMjBpbGx1c3RyYXRpb258ZW58MHx8fHwxNzgyMzA2MjY0fDA&ixlib=rb-4.1.0&q=85",
                }}
                style={{ width: 110, height: 110, borderRadius: 16, marginBottom: spacing.md }}
                contentFit="cover"
              />
              <Text
                style={{
                  color: colors.onSurface,
                  fontSize: 17,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                Aún no hay gastos
              </Text>
              <Text
                style={{
                  color: colors.onSurfaceTertiary,
                  marginTop: 4,
                  textAlign: "center",
                  fontSize: 14,
                }}
              >
                Toca el botón + para añadir tu primer gasto
              </Text>
            </View>
          ) : (
            recent.map(({ date, items }) => (
              <View key={date} style={{ marginTop: spacing.md }}>
                <Text
                  style={{
                    color: colors.onSurfaceTertiary,
                    fontSize: 12,
                    fontWeight: "700",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {formatDateLong(date)}
                </Text>
                <View
                  style={{
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderRadius: radius.md,
                    overflow: "hidden",
                  }}
                >
                  {items.map((e, i) => {
                    const cat = CATEGORY_MAP[e.category];
                    return (
                      <View
                        key={e.id}
                        style={[
                          styles.expRow,
                          {
                            borderBottomColor: colors.divider,
                            borderBottomWidth: i < items.length - 1 ? StyleSheet.hairlineWidth : 0,
                            padding: spacing.md,
                          },
                        ]}
                        testID={`expense-row-${e.id}`}
                      >
                        <CategoryBadge category={cat} size={40} />
                        <View style={{ flex: 1, marginLeft: spacing.md }}>
                          <Text
                            style={{ color: colors.onSurface, fontSize: 15, fontWeight: "600" }}
                            numberOfLines={1}
                          >
                            {cat.label}
                          </Text>
                          {!!e.description && (
                            <Text
                              style={{ color: colors.onSurfaceTertiary, fontSize: 12, marginTop: 2 }}
                              numberOfLines={1}
                            >
                              {e.description}
                            </Text>
                          )}
                        </View>
                        <Text
                          style={{ color: colors.onSurface, fontSize: 15, fontWeight: "700" }}
                        >
                          -{formatMoney(e.amount, settings.currency)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <FAB bottom={Platform.OS === "ios" ? 100 : 86} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 5,
  },
  heroLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },
  heroAmount: { color: "#fff", fontSize: 38, fontWeight: "800", marginTop: 4 },
  heroRow: { flexDirection: "row", justifyContent: "space-between" },
  heroSmallLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "600" },
  heroSmallValue: { color: "#fff", fontSize: 14, fontWeight: "700", marginTop: 2 },
  heroSetBudget: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroSetBudgetText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  statCard: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyCard: {
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
  expRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
