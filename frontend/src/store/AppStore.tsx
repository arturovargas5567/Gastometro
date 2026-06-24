import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ACHIEVEMENTS } from "../constants/achievements";
import { CategoryId } from "../constants/categories";
import { AchievementsState, Expense, Settings, StreakInfo } from "./types";

const KEYS = {
  expenses: "@gastometro/expenses",
  settings: "@gastometro/settings",
  streak: "@gastometro/streak",
  achievements: "@gastometro/achievements",
};

interface AppStoreCtx {
  loaded: boolean;
  expenses: Expense[];
  settings: Settings;
  streak: StreakInfo;
  achievements: AchievementsState;
  newlyUnlocked: string[];
  clearNewlyUnlocked: () => void;

  addExpense: (e: Omit<Expense, "id" | "createdAt">) => Promise<Expense>;
  updateExpense: (id: string, patch: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  setMonthlyBudget: (n: number | undefined) => Promise<void>;
  setCurrency: (code: string) => Promise<void>;
  setCategoryBudget: (cat: CategoryId, amount: number | undefined) => Promise<void>;

  resetAll: () => Promise<void>;
}

const Ctx = createContext<AppStoreCtx | null>(null);

const DEFAULT_SETTINGS: Settings = {
  monthlyBudget: undefined,
  currency: "EUR",
  categoryBudgets: {},
};

const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const diffDays = (a: string, b: string) => {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((da - db) / 86400000);
};

const sumInMonth = (expenses: Expense[], year: number, month: number) =>
  expenses
    .filter((e) => {
      const d = new Date(e.date + "T00:00:00");
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .reduce((s, e) => s + e.amount, 0);

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loaded, setLoaded] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [streak, setStreak] = useState<StreakInfo>({ count: 0, longest: 0 });
  const [achievements, setAchievements] = useState<AchievementsState>({});
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  // Load
  useEffect(() => {
    (async () => {
      try {
        const [exp, set, st, ach] = await Promise.all([
          AsyncStorage.getItem(KEYS.expenses),
          AsyncStorage.getItem(KEYS.settings),
          AsyncStorage.getItem(KEYS.streak),
          AsyncStorage.getItem(KEYS.achievements),
        ]);
        if (exp) setExpenses(JSON.parse(exp));
        if (set) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(set) });
        if (st) setStreak(JSON.parse(st));
        if (ach) setAchievements(JSON.parse(ach));
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persistExpenses = useCallback((next: Expense[]) => {
    setExpenses(next);
    AsyncStorage.setItem(KEYS.expenses, JSON.stringify(next)).catch(() => {});
  }, []);

  const persistSettings = useCallback((next: Settings) => {
    setSettings(next);
    AsyncStorage.setItem(KEYS.settings, JSON.stringify(next)).catch(() => {});
  }, []);

  const persistStreak = useCallback((next: StreakInfo) => {
    setStreak(next);
    AsyncStorage.setItem(KEYS.streak, JSON.stringify(next)).catch(() => {});
  }, []);

  const persistAchievements = useCallback((next: AchievementsState) => {
    setAchievements(next);
    AsyncStorage.setItem(KEYS.achievements, JSON.stringify(next)).catch(() => {});
  }, []);

  const evaluateAchievements = useCallback(
    (nextExpenses: Expense[], nextStreak: StreakInfo, nextSettings: Settings) => {
      const unlocked: string[] = [];
      const now = new Date().toISOString();
      const updated: AchievementsState = { ...achievements };
      const mark = (id: string) => {
        if (!updated[id]?.unlocked) {
          updated[id] = { unlocked: true, unlockedAt: now };
          unlocked.push(id);
        }
      };

      if (nextExpenses.length >= 1) mark("first_expense");
      if (nextStreak.count >= 7 || nextStreak.longest >= 7) mark("streak_7");

      const cats = new Set(nextExpenses.map((e) => e.category));
      if (cats.size >= 5) mark("explorer");
      if (nextExpenses.length >= 50) mark("fifty_expenses");

      // For the budget-based ones, evaluate previous full months only.
      if (nextSettings.monthlyBudget && nextSettings.monthlyBudget > 0) {
        const now = new Date();
        // Inspect all months from the earliest expense to the previous month
        const months = new Set<string>();
        nextExpenses.forEach((e) => months.add(e.date.substring(0, 7)));
        months.forEach((ym) => {
          const [y, m] = ym.split("-").map(Number);
          // Skip current month
          if (y === now.getFullYear() && m - 1 === now.getMonth()) return;
          const total = sumInMonth(nextExpenses, y, m - 1);
          if (total <= nextSettings.monthlyBudget!) mark("under_budget");
          if (total <= nextSettings.monthlyBudget! * 0.8) mark("saver");
        });
      }

      if (unlocked.length) {
        persistAchievements(updated);
        setNewlyUnlocked((prev) => [...prev, ...unlocked]);
      }
    },
    [achievements, persistAchievements]
  );

  const updateStreak = useCallback(
    (expenseDate: string, nextExpenses: Expense[], nextSettings: Settings) => {
      const today = todayStr();
      // Only update streak if registering today's expense
      if (expenseDate !== today) {
        evaluateAchievements(nextExpenses, streak, nextSettings);
        return;
      }
      let nextStreak: StreakInfo;
      if (!streak.lastDate) {
        nextStreak = { lastDate: today, count: 1, longest: Math.max(1, streak.longest) };
      } else if (streak.lastDate === today) {
        nextStreak = streak; // same day, no change
      } else {
        const d = diffDays(today, streak.lastDate);
        if (d === 1) {
          const cnt = streak.count + 1;
          nextStreak = {
            lastDate: today,
            count: cnt,
            longest: Math.max(cnt, streak.longest),
          };
        } else {
          nextStreak = { lastDate: today, count: 1, longest: Math.max(1, streak.longest) };
        }
      }
      persistStreak(nextStreak);
      evaluateAchievements(nextExpenses, nextStreak, nextSettings);
    },
    [streak, persistStreak, evaluateAchievements]
  );

  const addExpense: AppStoreCtx["addExpense"] = useCallback(
    async (e) => {
      const newExp: Expense = {
        ...e,
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: new Date().toISOString(),
      };
      const next = [newExp, ...expenses];
      persistExpenses(next);
      updateStreak(newExp.date, next, settings);
      return newExp;
    },
    [expenses, persistExpenses, settings, updateStreak]
  );

  const updateExpense: AppStoreCtx["updateExpense"] = useCallback(
    async (id, patch) => {
      const next = expenses.map((e) => (e.id === id ? { ...e, ...patch } : e));
      persistExpenses(next);
      evaluateAchievements(next, streak, settings);
    },
    [expenses, persistExpenses, evaluateAchievements, streak, settings]
  );

  const deleteExpense: AppStoreCtx["deleteExpense"] = useCallback(
    async (id) => {
      const next = expenses.filter((e) => e.id !== id);
      persistExpenses(next);
    },
    [expenses, persistExpenses]
  );

  const setMonthlyBudget = useCallback(
    async (n: number | undefined) => {
      const next = { ...settings, monthlyBudget: n };
      persistSettings(next);
    },
    [settings, persistSettings]
  );

  const setCurrency = useCallback(
    async (code: string) => {
      persistSettings({ ...settings, currency: code });
    },
    [settings, persistSettings]
  );

  const setCategoryBudget = useCallback(
    async (cat: CategoryId, amount: number | undefined) => {
      const cb = { ...settings.categoryBudgets };
      if (amount === undefined || amount <= 0) delete cb[cat];
      else cb[cat] = amount;
      persistSettings({ ...settings, categoryBudgets: cb });
    },
    [settings, persistSettings]
  );

  const resetAll = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(KEYS.expenses),
      AsyncStorage.removeItem(KEYS.settings),
      AsyncStorage.removeItem(KEYS.streak),
      AsyncStorage.removeItem(KEYS.achievements),
    ]);
    setExpenses([]);
    setSettings(DEFAULT_SETTINGS);
    setStreak({ count: 0, longest: 0 });
    setAchievements({});
    setNewlyUnlocked([]);
  }, []);

  const value = useMemo<AppStoreCtx>(
    () => ({
      loaded,
      expenses,
      settings,
      streak,
      achievements,
      newlyUnlocked,
      clearNewlyUnlocked: () => setNewlyUnlocked([]),
      addExpense,
      updateExpense,
      deleteExpense,
      setMonthlyBudget,
      setCurrency,
      setCategoryBudget,
      resetAll,
    }),
    [
      loaded,
      expenses,
      settings,
      streak,
      achievements,
      newlyUnlocked,
      addExpense,
      updateExpense,
      deleteExpense,
      setMonthlyBudget,
      setCurrency,
      setCategoryBudget,
      resetAll,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAppStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAppStore must be used inside AppStoreProvider");
  return c;
};

// Helpers exported for screens
export const expenseHelpers = {
  totalForMonth(expenses: Expense[], year: number, month: number) {
    return sumInMonth(expenses, year, month);
  },
  filterMonth(expenses: Expense[], year: number, month: number) {
    return expenses.filter((e) => {
      const d = new Date(e.date + "T00:00:00");
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },
};
