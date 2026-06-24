import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BarChart } from "@/src/components/BarChart";
import { CategoryBadge } from "@/src/components/CategoryBadge";
import { DonutChart } from "@/src/components/DonutChart";
import { CATEGORIES, CATEGORY_MAP, CategoryId } from "@/src/constants/categories";
import { expenseHelpers, useAppStore } from "@/src/store/AppStore";
import { useTheme } from "@/src/theme/ThemeContext";
import {
  MONTHS_ES,
  WEEKDAYS_ES,
  WEEKDAYS_LONG_ES,
  formatMoney,
  formatMoneyShort,
} from "@/src/utils/format";

type View = "categories" | "weekly";

export default function StatsScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { expenses, settings } = useAppStore();
  const [view, setView] = useState<View>("categories");

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const monthExpenses = useMemo(
    () => expenseHelpers.filterMonth(expenses, y, m),
    [expenses, y, m]
  );

  // Previous month
  const prevDate = new Date(y, m - 1, 1);
  const prevExpenses = useMemo(
    () => expenseHelpers.filterMonth(expenses, prevDate.getFullYear(), prevDate.getMonth()),
    [expenses, prevDate]
  );

  const totalMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalPrev = prevExpenses.reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const byCat = useMemo(() => {
    const map: Record<string, number> = {};
    monthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    });
    return CATEGORIES.map((c) => ({
      cat: c,
      total: map[c.id] ?? 0,
    }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [monthExpenses]);

  const topCategory = byCat[0];

  // Weekly evolution (last 8 weeks)
  const weeks = useMemo(() => {
    const arr: { label: string; value: number; start: Date }[] = [];
    const today = new Date();
    const day = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0=Mon
    const thisMonStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - day);
    for (let i = 7; i >= 0; i--) {
      const start = new Date(thisMonStart);
      start.setDate(thisMonStart.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      const sum = expenses
        .filter((e) => {
          const d = new Date(e.date + "T00:00:00");
          return d >= start && d < end;
        })
        .reduce((s, e) => s + e.amount, 0);
      arr.push({
        label: `${start.getDate()}/${start.getMonth() + 1}`,
        value: sum,
        start,
      });
    }
    return arr;
  }, [expenses]);

  // Weekday distribution (current month)
  const weekdayDist = useMemo(() => {
    const arr = [0, 0, 0, 0, 0, 0, 0]; // Mon..Sun
    monthExpenses.forEach((e) => {
      const d = new Date(e.date + "T00:00:00");
      const w = d.getDay() === 0 ? 6 : d.getDay() - 1;
      arr[w] += e.amount;
    });
    return arr;
  }, [monthExpenses]);
  const topWeekdayIdx = weekdayDist.indexOf(Math.max(...weekdayDist));

  // Habit summary
  const diff = totalMonth - totalPrev;
  const diffPct = totalPrev > 0 ? (diff / totalPrev) * 100 : 0;

  let motivation = "Sigue así, pequeños cambios marcan grandes diferencias.";
  if (totalPrev === 0 && totalMonth > 0) motivation = "¡Bienvenido! Cada gasto registrado es un paso hacia el control financiero.";
  else if (diff < 0) motivation = `Has gastado un ${Math.abs(diffPct).toFixed(0)}% menos que el mes pasado. ¡Genial!`;
  else if (diff > 0 && totalPrev > 0) motivation = `Has gastado un ${diffPct.toFixed(0)}% más que el mes pasado. Cuida tu presupuesto.`;

  const hasData = monthExpenses.length > 0 || prevExpenses.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: 130,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
          <Text style={{ color: colors.onSurfaceTertiary, fontSize: 13, fontWeight: "600" }}>
            {MONTHS_ES[m]} {y}
          </Text>
          <Text style={{ color: colors.onSurface, fontSize: 28, fontWeight: "800", marginTop: 2 }}>
            Estadísticas
          </Text>
        </View>

        {/* Segmented */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: spacing.lg,
            backgroundColor: colors.surfaceTertiary,
            borderRadius: radius.pill,
            padding: 4,
          }}
        >
          {(["categories", "weekly"] as View[]).map((v) => (
            <Pressable
              key={v}
              testID={`segment-${v}`}
              onPress={() => setView(v)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: view === v ? colors.surfaceSecondary : "transparent",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: view === v ? colors.onSurface : colors.onSurfaceTertiary,
                  fontWeight: "700",
                  fontSize: 13,
                }}
              >
                {v === "categories" ? "Categorías" : "Semanal"}
              </Text>
            </Pressable>
          ))}
        </View>

        {!hasData ? (
          <View
            style={{
              margin: spacing.lg,
              padding: spacing.xl,
              backgroundColor: colors.surfaceSecondary,
              borderRadius: radius.lg,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
              alignItems: "center",
            }}
            testID="stats-empty"
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.brandTertiary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: spacing.md,
              }}
            >
              <Ionicons name="pie-chart" size={36} color={colors.brandPrimary} />
            </View>
            <Text style={{ color: colors.onSurface, fontSize: 17, fontWeight: "700" }}>
              Aún no hay datos
            </Text>
            <Text
              style={{
                color: colors.onSurfaceTertiary,
                marginTop: 6,
                textAlign: "center",
              }}
            >
              Registra algunos gastos para visualizar tus estadísticas
            </Text>
          </View>
        ) : view === "categories" ? (
          <>
            {/* Donut */}
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderRadius: radius.lg, marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.lg },
              ]}
            >
              <Text style={{ color: colors.onSurfaceTertiary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Distribución por categoría
              </Text>
              <View style={{ alignItems: "center", marginTop: spacing.md }}>
                <DonutChart
                  data={byCat.map((c) => ({ value: c.total, color: c.cat.color, label: c.cat.label }))}
                  size={200}
                  strokeWidth={32}
                  backgroundColor={colors.surfaceSecondary}
                  center={
                    <View style={{ alignItems: "center" }}>
                      <Text style={{ color: colors.onSurfaceTertiary, fontSize: 11, fontWeight: "600" }}>
                        Total
                      </Text>
                      <Text style={{ color: colors.onSurface, fontSize: 20, fontWeight: "800" }}>
                        {formatMoneyShort(totalMonth, settings.currency)}
                      </Text>
                    </View>
                  }
                />
              </View>

              {/* Legend list */}
              <View style={{ marginTop: spacing.lg, gap: 10 }}>
                {byCat.map(({ cat, total }) => {
                  const pct = totalMonth > 0 ? (total / totalMonth) * 100 : 0;
                  return (
                    <View key={cat.id} style={{ flexDirection: "row", alignItems: "center" }}>
                      <CategoryBadge category={cat} size={32} />
                      <View style={{ flex: 1, marginLeft: spacing.md }}>
                        <Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 14 }}>
                          {cat.label}
                        </Text>
                        <Text style={{ color: colors.onSurfaceTertiary, fontSize: 12 }}>
                          {pct.toFixed(1)}%
                        </Text>
                      </View>
                      <Text style={{ color: colors.onSurface, fontWeight: "700" }}>
                        {formatMoney(total, settings.currency)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Weekly bar */}
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderRadius: radius.lg, marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.lg },
              ]}
            >
              <Text style={{ color: colors.onSurfaceTertiary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Evolución semanal (últimas 8 semanas)
              </Text>
              <View style={{ marginTop: spacing.md }}>
                <BarChart
                  data={weeks.map((w, i) => ({
                    label: w.label,
                    value: w.value,
                    emphasize: i === weeks.length - 1,
                  }))}
                  showValues
                  valueFormatter={(n) => formatMoneyShort(n, settings.currency)}
                />
              </View>
            </View>

            {/* Weekday */}
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderRadius: radius.lg, marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.lg },
              ]}
            >
              <Text style={{ color: colors.onSurfaceTertiary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Gasto por día de la semana
              </Text>
              <View style={{ marginTop: spacing.md }}>
                <BarChart
                  data={weekdayDist.map((v, i) => ({
                    label: WEEKDAYS_ES[i],
                    value: v,
                    emphasize: i === topWeekdayIdx && v > 0,
                  }))}
                />
              </View>
              {topWeekdayIdx >= 0 && weekdayDist[topWeekdayIdx] > 0 && (
                <Text style={{ marginTop: spacing.md, color: colors.onSurfaceTertiary, fontSize: 13 }}>
                  Sueles gastar más los{" "}
                  <Text style={{ color: colors.onSurface, fontWeight: "700" }}>
                    {WEEKDAYS_LONG_ES[topWeekdayIdx]}
                  </Text>
                </Text>
              )}
            </View>
          </>
        )}

        {/* Habit Analysis */}
        {hasData && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.brandTertiary,
                borderRadius: radius.lg,
                marginHorizontal: spacing.lg,
                marginTop: spacing.md,
                padding: spacing.lg,
              },
            ]}
            testID="habit-card"
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="sparkles" size={18} color={colors.brandPrimary} />
              <Text style={{ color: colors.onBrandTertiary, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Análisis de hábitos
              </Text>
            </View>
            {topCategory && (
              <Text style={{ color: colors.onBrandTertiary, marginTop: spacing.md, fontSize: 15 }}>
                Tu mayor gasto este mes fue en{" "}
                <Text style={{ fontWeight: "800" }}>{topCategory.cat.label}</Text> (
                {formatMoney(topCategory.total, settings.currency)}).
              </Text>
            )}
            {totalPrev > 0 && (
              <Text style={{ color: colors.onBrandTertiary, marginTop: 6, fontSize: 15 }}>
                Has{" "}
                <Text style={{ fontWeight: "800" }}>
                  {diff < 0 ? "ahorrado" : "gastado más"}{" "}
                  {formatMoney(Math.abs(diff), settings.currency)}
                </Text>{" "}
                respecto al mes anterior.
              </Text>
            )}
            <Text style={{ color: colors.onBrandTertiary, marginTop: spacing.md, fontStyle: "italic", fontSize: 14 }}>
              💡 {motivation}
            </Text>
          </View>
        )}

        {/* Months comparison */}
        {hasData && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                borderRadius: radius.lg,
                marginHorizontal: spacing.lg,
                marginTop: spacing.md,
                padding: spacing.lg,
              },
            ]}
          >
            <Text style={{ color: colors.onSurfaceTertiary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Comparación entre meses
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md, gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.onSurfaceTertiary, fontSize: 12, fontWeight: "600" }}>
                  {MONTHS_ES[prevDate.getMonth()]}
                </Text>
                <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "800", marginTop: 4 }}>
                  {formatMoney(totalPrev, settings.currency)}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={{ color: colors.brandPrimary, fontSize: 12, fontWeight: "700" }}>
                  {MONTHS_ES[m]}
                </Text>
                <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "800", marginTop: 4 }}>
                  {formatMoney(totalMonth, settings.currency)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 1,
  },
});

void CATEGORY_MAP;
void ({} as CategoryId);
