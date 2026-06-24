import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryBadge } from "@/src/components/CategoryBadge";
import { CATEGORIES, CATEGORY_MAP, CategoryId } from "@/src/constants/categories";
import { useAppStore } from "@/src/store/AppStore";
import { useTheme } from "@/src/theme/ThemeContext";
import { MONTHS_ES, currencySymbol } from "@/src/utils/format";

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function AddExpenseScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addExpense, settings } = useAppStore();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryId>("food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError(null);
    const v = parseFloat(amount.replace(",", "."));
    if (isNaN(v) || v <= 0) {
      setError("Introduce un importe válido");
      return;
    }
    setSaving(true);
    try {
      await addExpense({
        amount: v,
        category,
        date,
        description: description.trim() || undefined,
      });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  // Build a small date strip (last 14 days)
  const dateStrip = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { iso, day: d.getDate(), wd: d.getDay() };
  });

  const cat = CATEGORY_MAP[category];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.surface }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View
            style={{
              paddingTop: insets.top + spacing.sm,
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.md,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.surface,
            }}
          >
            <Pressable
              testID="cancel-add"
              onPress={() => router.back()}
              hitSlop={10}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.surfaceTertiary,
              }}
            >
              <Ionicons name="close" size={20} color={colors.onSurface} />
            </Pressable>
            <Text style={{ color: colors.onSurface, fontSize: 17, fontWeight: "800" }}>Nuevo gasto</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Amount input */}
            <View
              style={{
                alignItems: "center",
                paddingVertical: spacing.xl,
                paddingHorizontal: spacing.lg,
              }}
            >
              <Text style={{ color: colors.onSurfaceTertiary, fontSize: 13, fontWeight: "600" }}>
                Importe
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  marginTop: spacing.sm,
                }}
              >
                <TextInput
                  testID="amount-input"
                  autoFocus
                  value={amount}
                  onChangeText={(t) => {
                    setError(null);
                    setAmount(t.replace(/[^0-9.,]/g, ""));
                  }}
                  placeholder="0"
                  placeholderTextColor={colors.onSurfaceTertiary}
                  keyboardType="decimal-pad"
                  style={{
                    color: colors.onSurface,
                    fontSize: 56,
                    fontWeight: "800",
                    minWidth: 80,
                    textAlign: "right",
                    padding: 0,
                  }}
                />
                <Text
                  style={{
                    color: colors.onSurfaceTertiary,
                    fontSize: 28,
                    fontWeight: "700",
                    marginLeft: 8,
                    marginBottom: 8,
                  }}
                >
                  {currencySymbol(settings.currency)}
                </Text>
              </View>
              {error && (
                <Text style={{ color: colors.error, marginTop: 8, fontWeight: "600" }}>{error}</Text>
              )}
            </View>

            {/* Categories */}
            <View style={{ paddingHorizontal: spacing.lg }}>
              <Text style={[styles.fieldLabel, { color: colors.onSurfaceTertiary }]}>Categoría</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingVertical: 8 }}
              >
                {CATEGORIES.map((c) => {
                  const selected = c.id === category;
                  return (
                    <Pressable
                      key={c.id}
                      testID={`cat-${c.id}`}
                      onPress={() => setCategory(c.id)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        borderWidth: 1.5,
                        borderColor: selected ? c.color : colors.border,
                        backgroundColor: selected ? c.color + "1A" : colors.surfaceSecondary,
                        flexShrink: 0,
                        height: 40,
                      }}
                    >
                      <CategoryBadge category={c} size={24} />
                      <Text
                        style={{
                          marginLeft: 8,
                          color: selected ? c.color : colors.onSurface,
                          fontWeight: "700",
                          fontSize: 13,
                        }}
                      >
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Date strip */}
            <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
              <Text style={[styles.fieldLabel, { color: colors.onSurfaceTertiary }]}>Fecha</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
              >
                {dateStrip.map((d, i) => {
                  const selected = d.iso === date;
                  const day = new Date(d.iso + "T00:00:00");
                  const wd = day.getDay() === 0 ? 6 : day.getDay() - 1;
                  return (
                    <Pressable
                      key={d.iso}
                      testID={`date-${d.iso}`}
                      onPress={() => setDate(d.iso)}
                      style={{
                        width: 56,
                        paddingVertical: 10,
                        borderRadius: 14,
                        backgroundColor: selected ? cat.color : colors.surfaceSecondary,
                        borderWidth: 1,
                        borderColor: selected ? cat.color : colors.border,
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: selected ? "#fff" : colors.onSurfaceTertiary,
                        }}
                      >
                        {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"][wd]}
                      </Text>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "800",
                          color: selected ? "#fff" : colors.onSurface,
                          marginTop: 2,
                        }}
                      >
                        {d.day}
                      </Text>
                      {i === 0 && (
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: "700",
                            color: selected ? "rgba(255,255,255,0.8)" : colors.onSurfaceTertiary,
                            marginTop: 2,
                          }}
                        >
                          HOY
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Text style={{ color: colors.onSurfaceTertiary, fontSize: 12, marginTop: 4 }}>
                {new Date(date + "T00:00:00").getDate()} de{" "}
                {MONTHS_ES[new Date(date + "T00:00:00").getMonth()].toLowerCase()}{" "}
                {new Date(date + "T00:00:00").getFullYear()}
              </Text>
            </View>

            {/* Description */}
            <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
              <Text style={[styles.fieldLabel, { color: colors.onSurfaceTertiary }]}>
                Descripción (opcional)
              </Text>
              <TextInput
                testID="desc-input"
                value={description}
                onChangeText={setDescription}
                placeholder="Ej. Café con Ana"
                placeholderTextColor={colors.onSurfaceTertiary}
                style={{
                  marginTop: 4,
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: radius.md,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.border,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: colors.onSurface,
                  fontSize: 15,
                }}
                maxLength={120}
                returnKeyType="done"
              />
            </View>

            {/* Save button */}
            <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
              <Pressable
                testID="save-expense"
                disabled={saving}
                onPress={submit}
                style={({ pressed }) => ({
                  backgroundColor: colors.brandPrimary,
                  borderRadius: radius.lg,
                  paddingVertical: 16,
                  alignItems: "center",
                  opacity: saving ? 0.6 : pressed ? 0.85 : 1,
                  shadowColor: colors.brandPrimary,
                  shadowOpacity: 0.35,
                  shadowOffset: { width: 0, height: 8 },
                  shadowRadius: 16,
                  elevation: 4,
                })}
              >
                <Text style={{ color: colors.onBrandPrimary, fontSize: 16, fontWeight: "800" }}>
                  {saving ? "Guardando..." : "Guardar gasto"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
});
