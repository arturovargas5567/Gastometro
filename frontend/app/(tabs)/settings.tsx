import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CURRENCIES } from "@/src/constants/categories";
import { useAppStore } from "@/src/store/AppStore";
import { useTheme } from "@/src/theme/ThemeContext";
import { formatMoney } from "@/src/utils/format";

export default function SettingsScreen() {
  const { colors, spacing, radius, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, setMonthlyBudget, setCurrency, resetAll, expenses } = useAppStore();

  const [budgetModal, setBudgetModal] = useState(false);
  const [budgetValue, setBudgetValue] = useState("");
  const [currencyModal, setCurrencyModal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const openBudget = () => {
    setBudgetValue(settings.monthlyBudget?.toString() ?? "");
    setBudgetModal(true);
  };

  const saveBudget = async () => {
    const v = parseFloat(budgetValue.replace(",", "."));
    await setMonthlyBudget(isNaN(v) || v <= 0 ? undefined : v);
    setBudgetModal(false);
  };

  const clearBudget = async () => {
    await setMonthlyBudget(undefined);
    setBudgetModal(false);
  };

  const currentCurrency = CURRENCIES.find((c) => c.code === settings.currency) ?? CURRENCIES[0];

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
          <Text style={{ color: colors.onSurfaceTertiary, fontSize: 13, fontWeight: "600" }}>
            Personaliza tu app
          </Text>
          <Text style={{ color: colors.onSurface, fontSize: 28, fontWeight: "800", marginTop: 2 }}>
            Ajustes
          </Text>
        </View>

        {/* Preferences group */}
        <Group title="Preferencias" colors={colors} spacing={spacing}>
          <Row
            testID="setting-budget"
            colors={colors}
            spacing={spacing}
            icon="wallet-outline"
            iconBg={colors.brandTertiary}
            iconColor={colors.brandPrimary}
            label="Presupuesto mensual"
            value={
              settings.monthlyBudget
                ? formatMoney(settings.monthlyBudget, settings.currency)
                : "No fijado"
            }
            onPress={openBudget}
          />
          <Divider colors={colors} />
          <Row
            testID="setting-currency"
            colors={colors}
            spacing={spacing}
            icon="cash-outline"
            iconBg={colors.success + "22"}
            iconColor={colors.success}
            label="Moneda"
            value={`${currentCurrency.symbol}  ${currentCurrency.code}`}
            onPress={() => setCurrencyModal(true)}
          />
          <Divider colors={colors} />
          <View
            style={{
              padding: spacing.md,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <IconBubble icon="moon" bg={colors.info + "22"} color={colors.info} />
            <Text style={{ flex: 1, color: colors.onSurface, fontWeight: "600", marginLeft: spacing.md }}>
              Tema oscuro
            </Text>
            <Switch
              testID="setting-dark-mode"
              value={mode === "dark"}
              onValueChange={(v) => setMode(v ? "dark" : "light")}
              trackColor={{ false: colors.surfaceTertiary, true: colors.brandPrimary }}
              thumbColor="#fff"
            />
          </View>
        </Group>

        {/* Data group */}
        <Group title="Datos" colors={colors} spacing={spacing}>
          <Row
            colors={colors}
            spacing={spacing}
            icon="document-text-outline"
            iconBg={colors.brandTertiary}
            iconColor={colors.brandPrimary}
            label="Gastos registrados"
            value={`${expenses.length}`}
          />
          <Divider colors={colors} />
          <Row
            testID="setting-reset"
            colors={colors}
            spacing={spacing}
            icon="trash-outline"
            iconBg={colors.error + "22"}
            iconColor={colors.error}
            label="Borrar todos los datos"
            value=""
            labelColor={colors.error}
            onPress={() => setConfirmReset(true)}
          />
        </Group>

        {/* About */}
        <Group title="Acerca de" colors={colors} spacing={spacing}>
          <Row
            colors={colors}
            spacing={spacing}
            icon="information-circle-outline"
            iconBg={colors.surfaceTertiary}
            iconColor={colors.onSurfaceTertiary}
            label="Versión"
            value="1.0.0"
          />
        </Group>

        {/* Watermark */}
        <View style={{ marginTop: spacing.xxl, alignItems: "center" }} testID="watermark">
          <Text style={{ color: colors.onSurfaceTertiary, fontSize: 12, fontWeight: "600", letterSpacing: 1.5 }}>
            G A S T Ó M E T R O
          </Text>
          <Text
            style={{
              color: colors.onSurfaceTertiary,
              fontSize: 11,
              marginTop: 6,
              opacity: 0.65,
              letterSpacing: 2,
            }}
          >
            by Arturo Vargas
          </Text>
        </View>
      </ScrollView>

      {/* Budget modal */}
      <Modal visible={budgetModal} transparent animationType="fade" onRequestClose={() => setBudgetModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalRoot}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setBudgetModal(false)} />
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg },
            ]}
          >
            <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "800" }}>
              Presupuesto mensual
            </Text>
            <Text style={{ color: colors.onSurfaceTertiary, marginTop: 4, fontSize: 13 }}>
              Es opcional. Déjalo vacío y pulsa "Quitar" para no fijar un presupuesto.
            </Text>
            <TextInput
              testID="budget-input"
              value={budgetValue}
              onChangeText={setBudgetValue}
              keyboardType="decimal-pad"
              placeholder="Ej. 1500"
              placeholderTextColor={colors.onSurfaceTertiary}
              style={{
                marginTop: spacing.lg,
                borderWidth: 1.5,
                borderColor: colors.border,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 17,
                fontWeight: "700",
                color: colors.onSurface,
              }}
              autoFocus
            />
            <View style={{ flexDirection: "row", gap: 8, marginTop: spacing.lg }}>
              <Pressable
                onPress={clearBudget}
                style={[
                  styles.btn,
                  { backgroundColor: colors.surfaceTertiary, flex: 1, borderRadius: 12 },
                ]}
              >
                <Text style={{ color: colors.onSurface, fontWeight: "700" }}>Quitar</Text>
              </Pressable>
              <Pressable
                testID="budget-save"
                onPress={saveBudget}
                style={[
                  styles.btn,
                  { backgroundColor: colors.brandPrimary, flex: 1.4, borderRadius: 12 },
                ]}
              >
                <Text style={{ color: colors.onBrandPrimary, fontWeight: "800" }}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Currency modal */}
      <Modal
        visible={currencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setCurrencyModal(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCurrencyModal(false)} />
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg },
            ]}
          >
            <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "800", marginBottom: spacing.md }}>
              Elige moneda
            </Text>
            {CURRENCIES.map((c, i) => (
              <Pressable
                key={c.code}
                testID={`currency-${c.code}`}
                onPress={() => {
                  setCurrency(c.code);
                  setCurrencyModal(false);
                }}
                style={{
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                  borderTopColor: colors.divider,
                }}
              >
                <Text style={{ width: 36, fontSize: 18, color: colors.onSurface, fontWeight: "700" }}>
                  {c.symbol}
                </Text>
                <Text style={{ flex: 1, color: colors.onSurface, fontSize: 15 }}>{c.label}</Text>
                {settings.currency === c.code && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.brandPrimary} />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Confirm reset */}
      <Modal
        visible={confirmReset}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmReset(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setConfirmReset(false)} />
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg },
            ]}
          >
            <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: "800" }}>
              ¿Borrar todos los datos?
            </Text>
            <Text style={{ color: colors.onSurfaceTertiary, marginTop: 6 }}>
              Esta acción no se puede deshacer. Se eliminarán todos los gastos, presupuestos y logros.
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: spacing.lg }}>
              <Pressable
                onPress={() => setConfirmReset(false)}
                style={[styles.btn, { backgroundColor: colors.surfaceTertiary, flex: 1, borderRadius: 12 }]}
              >
                <Text style={{ color: colors.onSurface, fontWeight: "700" }}>Cancelar</Text>
              </Pressable>
              <Pressable
                testID="reset-confirm"
                onPress={async () => {
                  await resetAll();
                  setConfirmReset(false);
                }}
                style={[styles.btn, { backgroundColor: colors.error, flex: 1, borderRadius: 12 }]}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>Borrar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helpers
const Group: React.FC<React.PropsWithChildren<{ title: string; colors: any; spacing: any }>> = ({
  title,
  colors,
  spacing,
  children,
}) => (
  <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
    <Text
      style={{
        color: colors.onSurfaceTertiary,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 8,
        marginLeft: 4,
      }}
    >
      {title}
    </Text>
    <View
      style={{
        backgroundColor: colors.surfaceSecondary,
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  </View>
);

const IconBubble: React.FC<{ icon: any; bg: string; color: string }> = ({ icon, bg, color }) => (
  <View
    style={{
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: bg,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Ionicons name={icon} size={18} color={color} />
  </View>
);

const Row: React.FC<{
  colors: any;
  spacing: any;
  icon: any;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  onPress?: () => void;
  labelColor?: string;
  testID?: string;
}> = ({ colors, spacing, icon, iconBg, iconColor, label, value, onPress, labelColor, testID }) => (
  <Pressable
    testID={testID}
    onPress={onPress}
    style={({ pressed }) => [
      {
        padding: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: pressed && onPress ? colors.surfaceTertiary : "transparent",
      },
    ]}
  >
    <IconBubble icon={icon} bg={iconBg} color={iconColor} />
    <Text
      style={{
        flex: 1,
        color: labelColor ?? colors.onSurface,
        fontWeight: "600",
        marginLeft: spacing.md,
      }}
    >
      {label}
    </Text>
    {!!value && (
      <Text style={{ color: colors.onSurfaceTertiary, marginRight: onPress ? 4 : 0 }}>{value}</Text>
    )}
    {onPress && <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceTertiary} />}
  </Pressable>
);

const Divider: React.FC<{ colors: any }> = ({ colors }) => (
  <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginLeft: 60 }} />
);

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 10,
  },
  btn: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
