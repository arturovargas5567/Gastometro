import { Ionicons } from "@expo/vector-icons";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_expense",
    title: "Primer paso",
    description: "Registra tu primer gasto",
    icon: "footsteps",
    color: "#7E57C2",
  },
  {
    id: "streak_7",
    title: "Constancia",
    description: "Registra gastos 7 días seguidos",
    icon: "flame",
    color: "#FF6B6B",
  },
  {
    id: "under_budget",
    title: "Mes ejemplar",
    description: "Termina un mes dentro de tu presupuesto",
    icon: "trophy",
    color: "#FFD60A",
  },
  {
    id: "saver",
    title: "Ahorrador",
    description: "Gasta menos del 80% del presupuesto en un mes",
    icon: "wallet",
    color: "#34C759",
  },
  {
    id: "explorer",
    title: "Explorador",
    description: "Usa al menos 5 categorías distintas",
    icon: "compass",
    color: "#0A84FF",
  },
  {
    id: "fifty_expenses",
    title: "Anotador",
    description: "Registra 50 gastos en total",
    icon: "create",
    color: "#F472B6",
  },
];
