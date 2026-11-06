import type { Calendar, CalendarCell, Entry, Meter } from "@/lib/types";
import { addDays, addMonths, format, toUTC } from "./dates";

const n = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 1 });

export function meter(key: Meter["key"], total: number, goal: number | null): Meter {
  const g = key === "protein" ? "g" : "";
  const left = (goal ?? 0) - total;
  return {
    key,
    label: key === "calories" ? "Calories" : "Protein",
    value: n(total),
    unit: key === "calories" ? "kcal" : "g",
    pct: goal ? Math.min(total / goal, 1) : 0,
    caption: !goal ? "No goal set" : left >= 0 ? `${n(left)}${g} left of ${n(goal)}${g}` : `${n(-left)}${g} over`,
    over: !!goal && left < 0,
  };
}

export function dayMeta(date: string, today: string) {
  const yesterday = addDays(today, -1);
  return {
    label: date === today ? "Today" : date === yesterday ? "Yesterday" : format(date, { weekday: "long" }),
    sublabel: format(date, { month: "long", day: "numeric", year: "numeric" }),
    prev: addDays(date, -1),
    next: date < today ? addDays(date, 1) : null,
  };
}

export function totals(entries: Entry[]) {
  return entries.reduce(
    (t, e) => ({ calories: t.calories + e.calories, protein: Math.round((t.protein + e.protein) * 10) / 10 }),
    { calories: 0, protein: 0 },
  );
}

export function monthRange(month: string) {
  return { from: `${month}-01`, to: addDays(`${addMonths(month, 1)}-01`, -1) };
}

// Sunday-first month grid; null = padding cell.
export function calendar(month: string, today: string, logged: Set<string>): Calendar {
  const { from, to } = monthRange(month);
  const cells: (CalendarCell | null)[] = Array(toUTC(from).getUTCDay()).fill(null);
  for (let d = from; d <= to; d = addDays(d, 1)) {
    cells.push({ date: d, day: Number(d.slice(8)), logged: logged.has(d), disabled: d > today, today: d === today });
  }
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const next = addMonths(month, 1);
  return {
    month,
    label: format(from, { month: "long", year: "numeric" }),
    prev: addMonths(month, -1),
    next: next <= today.slice(0, 7) ? next : null,
    weeks,
  };
}
