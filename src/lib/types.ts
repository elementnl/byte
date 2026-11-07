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
  weight: DayWeight;
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

export type DayWeight = {
  value: number | null;
  display: string | null;
  avg: string | null;
  direction: "up" | "down" | null; // this week's avg vs last week's
};

export type Point = { x: number; y: number }; // 0–1, y=0 is top

export type WeightView = {
  range: string;
  todayWeight: number | null;
  headline: { weight: string; change: string; direction: "up" | "down" | null; period: string } | null;
  chart: { dots: Point[]; avg: Point[]; yLabels: { y: number; label: string }[]; xLabels: [string, string] } | null;
};
