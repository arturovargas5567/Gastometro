import { CategoryId } from "../constants/categories";

export interface Expense {
  id: string;
  amount: number;
  category: CategoryId;
  date: string; // ISO yyyy-mm-dd
  description?: string;
  createdAt: string; // ISO datetime
}

export interface Settings {
  monthlyBudget?: number; // optional
  currency: string; // EUR, USD ...
  categoryBudgets: Partial<Record<CategoryId, number>>;
}

export interface StreakInfo {
  lastDate?: string; // yyyy-mm-dd
  count: number;
  longest: number;
}

export type AchievementsState = Record<string, { unlocked: boolean; unlockedAt?: string }>;
