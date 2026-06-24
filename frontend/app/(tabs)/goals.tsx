import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryBadge } from "@/src/components/CategoryBadge";
import { ProgressBar } from "@/src/components/ProgressBar";
import { ACHIEVEMENTS } from "@/src/constants/achievements";
import { CATEGORIES, CategoryId } from "@/src/constants/categories";
import { expenseHelpers, useAppStore } from "@/src/store/AppStore";
import { useTheme } from "@/src/theme/ThemeContext";
import { formatMoney } from "@/src/utils/format";

export default function GoalsScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { expenses, settings, setCategoryBudget, achievements } = useAppStore();

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const monthExpenses = useMemo(
    () => expenseHelpers.filterMonth(expenses, y, m),
    [expenses, y, m]
  );

  const totalsByCat = useMemo(() => {
    const map: Partial<Record<CategoryId, number>> = {};
    monthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    });
    return map;
  }, [monthExpenses]);

  const [editing, setEditing] = useState<CategoryId | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (id: CategoryId) => {
    setEditing(id);
    setEditValue(settings.categoryBudgets[id]?.toString() ?? "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    const v = parseFloat(editValue.replace(",", "."));
    await setCategoryBudget(editing, isNaN(v) || v <= 0 ? undefined : v);
    setEditing(null);
    setEditValue("");
  };

  const unlockedCount = Object.values(achievements).filter((a) => a?.unlocked).length;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.surface }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
          <Text style={{ color: colors.onSurfaceTertiary, fontSize: 13, fontWeight: "600" }}>
            Mes en curso
          </Text>
          <Text style={{ color: colors.onSurface, fontSize: 28, fontWeight: "800", marginTop: 2 }}>
            Objetivos
          </Text>
        </View>

        {/* Category budgets */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
            Límites por categoría
          </Text>
          <Text style={{ color: colors.onSurfaceTertiary, fontSize: 13, marginTop: 4, marginBottom: spacing.md }}>
            Opcional. Toca cualquier categoría para fijar un máximo mensual.
          </Text>

          <View
            style={{
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.lg,
              overflow: "hidden",
            }}
          >
            {CATEGORIES.map((cat, i) => {
              const limit = settings.categoryBudgets[cat.id];
              const spent = totalsByCat[cat.id] ?? 0;
              const isEditing = editing === cat.id;
              const ratio = limit ? spent / limit : 0;
              const over = limit && spent > limit;

              return (
                <Pressable
                  key={cat.id}
                  onPress={() => !isEditing && startEdit(cat.id)}
                  testID={`goal-row-${cat.id}`}
                  style={{
                    padding: spacing.md,
                    borderBottomColor: colors.divider,
                    borderBottomWidth: i < CATEGORIES.length - 1 ? StyleSheet.hairlineWidth : 0,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <CategoryBadge category={cat} size={36} />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 15 }}>
                        {cat.label}
                      </Text>
                      {limit ? (
                        <Text
                          style={{
                            color: over ? colors.error : colors.onSurfaceTertiary,
                            fontSize: 12,
                            marginTop: 2,
                            fontWeight: over ? "700" : "500",
                          }}
                        >
                          {formatMoney(spent, settings.currency)} /{" "}
                          {formatMoney(limit, settings.currency)}
                          {over ? "  ⚠️ excedido" : ""}
                        </Text>
                      ) : (
                        <Text style={{ color: colors.onSurfaceTertiary, fontSize: 12, marginTop: 2 }}>
                          Sin límite
                        </Text>
                      )}
                    </View>
                    {isEditing ? (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <TextInput
                          autoFocus
                          testID={`goal-input-${cat.id}`}
                          value={editValue}
                          onChangeText={setEditValue}
                          keyboardType="decimal-pad"
                          placeholder="0"
                          placeholderTextColor={colors.onSurfaceTertiary}
                          style={{
                            width: 80,
                            borderWidth: 1,
                            borderColor: colors.brandPrimary,
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 6,
                            color: colors.onSurface,
                            textAlign: "right",
                            fontSize: 14,
                            fontWeight: "700",
                          }}
                        />
                        <Pressable onPress={saveEdit} testID={`goal-save-${cat.id}`}>
                          <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                        </Pressable>
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceTertiary} />
                    )}
                  </View>
                  {limit && !isEditing && (
                    <View style={{ marginTop: spacing.sm }}>
                      <ProgressBar progress={ratio} height={6} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Achievements */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Logros</Text>
            <Text style={{ color: colors.onSurfaceTertiary, fontSize: 13, fontWeight: "600" }}>
              {unlockedCount} / {ACHIEVEMENTS.length}
            </Text>
          </View>
          <Text style={{ color: colors.onSurfaceTertiary, fontSize: 13, marginTop: 4, marginBottom: spacing.md }}>
            Desbloquea insignias por tus buenos hábitos.
          </Text>

          <View style={styles.badgeGrid}>
            {ACHIEVEMENTS.map((a) => {
              const unlocked = !!achievements[a.id]?.unlocked;
              return (
                <View
                  key={a.id}
                  testID={`badge-${a.id}`}
                  style={[
                    styles.badge,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: unlocked ? a.color : colors.border,
                      borderRadius: radius.lg,
                      padding: spacing.md,
                      opacity: unlocked ? 1 : 0.55,
                    },
                  ]}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: unlocked ? a.color + "22" : colors.surfaceTertiary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name={unlocked ? a.icon : "lock-closed"}
                      size={26}
                      color={unlocked ? a.color : colors.onSurfaceTertiary}
                    />
                  </View>
                  <Text
                    style={{
                      color: colors.onSurface,
                      fontWeight: "700",
                      fontSize: 13,
                      marginTop: spacing.sm,
                      textAlign: "center",
                    }}
                    numberOfLines={1}
                  >
                    {a.title}
                  </Text>
                  <Text
                    style={{
                      color: colors.onSurfaceTertiary,
                      fontSize: 11,
                      marginTop: 2,
                      textAlign: "center",
                    }}
                    numberOfLines={2}
                  >
                    {a.description}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  badge: {
    width: "33.33%",
    marginVertical: 6,
    alignItems: "center",
    borderWidth: 1.5,
    minHeight: 132,
  },
});
