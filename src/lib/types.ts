import type { Theme } from "@/constants";

export type Entry = { id: string; name: string; protein: number; calories: number };

export type Meter = {
  key: "calories" | "protein";
  label: string;
  value: string; // formatted total, e.g. "1,240"
  unit: string;
  pct: number; // 0–1, clamped
  caption: string; // "760 left" / "120 over" / "No goal set"
  over: boolean;
};

export type Day = {
  date: string;
  label: string;
  sublabel: string;
  prev: string;
  next: string | null;
  entries: Entry[];
  meters: Meter[];
};

export type CalendarCell = { date: string; day: number; logged: boolean; disabled: boolean; today: boolean };

export type Calendar = {
  month: string;
  label: string;
  prev: string;
  next: string | null;
  weeks: (CalendarCell | null)[][];
};

export type Settings = { calorieGoal: number | null; proteinGoal: number | null; theme: Theme };
