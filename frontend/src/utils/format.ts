import { CURRENCIES } from "../constants/categories";

export const currencySymbol = (code: string) =>
  CURRENCIES.find((c) => c.code === code)?.symbol ?? "€";

export const formatMoney = (amount: number, currency: string) => {
  const symbol = currencySymbol(currency);
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = amount < 0 ? "-" : "";
  return `${sign}${formatted} ${symbol}`;
};

export const formatMoneyShort = (amount: number, currency: string) => {
  const symbol = currencySymbol(currency);
  const abs = Math.abs(amount);
  let s: string;
  if (abs >= 1_000_000) s = (abs / 1_000_000).toFixed(1) + "M";
  else if (abs >= 1000) s = (abs / 1000).toFixed(1) + "k";
  else s = abs.toFixed(0);
  return `${amount < 0 ? "-" : ""}${s} ${symbol}`;
};

export const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const WEEKDAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const WEEKDAYS_LONG_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export const formatDateShort = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDate();
  return `${day} ${MONTHS_ES[d.getMonth()].slice(0, 3).toLowerCase()}`;
};

export const formatDateLong = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
};

// Group by date and sort desc by date
export const groupByDate = <T extends { date: string }>(items: T[]): { date: string; items: T[] }[] => {
  const map = new Map<string, T[]>();
  items.forEach((it) => {
    const arr = map.get(it.date) ?? [];
    arr.push(it);
    map.set(it.date, arr);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, items]) => ({ date, items }));
};
