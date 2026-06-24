import { Ionicons } from "@expo/vector-icons";

export type CategoryId =
  | "food"
  | "transport"
  | "housing"
  | "shopping"
  | "leisure"
  | "health"
  | "subscriptions"
  | "other";

export interface Category {
  id: CategoryId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "food", label: "Comida", icon: "restaurant", color: "#FF6B6B" },
  { id: "transport", label: "Transporte", icon: "car", color: "#4ECDC4" },
  { id: "housing", label: "Vivienda", icon: "home", color: "#FFA94D" },
  { id: "shopping", label: "Compras", icon: "bag-handle", color: "#A78BFA" },
  { id: "leisure", label: "Ocio", icon: "game-controller", color: "#F472B6" },
  { id: "health", label: "Salud", icon: "heart", color: "#34C759" },
  { id: "subscriptions", label: "Suscripciones", icon: "repeat", color: "#0A84FF" },
  { id: "other", label: "Otros", icon: "ellipsis-horizontal", color: "#8E8E93" },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<CategoryId, Category>
);

export const CURRENCIES = [
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "USD", symbol: "$", label: "Dólar ($)" },
  { code: "GBP", symbol: "£", label: "Libra (£)" },
  { code: "MXN", symbol: "$", label: "Peso Mexicano ($)" },
  { code: "ARS", symbol: "$", label: "Peso Argentino ($)" },
];
