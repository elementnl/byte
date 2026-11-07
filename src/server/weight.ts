import { WEIGHT_UNIT, type WeightRange } from "@/constants";
import type { DayWeight, WeightView } from "@/lib/types";
import { addDays, format, toUTC } from "./dates";
import { db } from "./supabase";

type Row = { date: string; weight: number };

const fmt = (v: number) => v.toFixed(1);
const daysBetween = (a: string, b: string) => Math.round((toUTC(b).getTime() - toUTC(a).getTime()) / 864e5);

// Weigh-ins for a user in [from, to], oldest first. from = null → all.
// ponytail: PostgREST caps at 1000 rows (~3 years of daily weigh-ins); paginate if that's ever hit.
export async function fetchWeights(userId: string, from: string | null, to: string): Promise<Row[]> {
  let q = db().from("byte_weights").select("date, weight").eq("user_id", userId).lte("date", to).order("date");
  if (from) q = q.gte("date", from);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => ({ date: r.date, weight: Number(r.weight) }));
}

// Mean of weigh-ins in the 7 days ending on `date`. ponytail: O(n) per call, fine for personal data.
export function movingAvg(rows: Row[], date: string) {
  const from = addDays(date, -6);
  const win = rows.filter((r) => r.date >= from && r.date <= date);
  return win.length ? win.reduce((s, r) => s + r.weight, 0) / win.length : null;
}

// `rows` must cover the 13 days ending on `date` (this week's avg vs last week's).
export function dayWeight(rows: Row[], date: string): DayWeight {
  const value = rows.find((r) => r.date === date)?.weight ?? null;
  const avg = movingAvg(rows, date);
  const lastWeek = movingAvg(rows, addDays(date, -7));
  const diff = avg === null || lastWeek === null ? 0 : Math.round((avg - lastWeek) * 10);
  return {
    value,
    display: value === null ? null : fmt(value),
    avg: avg === null ? null : fmt(avg),
    direction: diff > 0 ? "up" : diff < 0 ? "down" : null,
  };
}

const PERIODS: Record<WeightRange, string> = { "7": "Past week", "30": "Past 30 days", "90": "Past 90 days", all: "All time" };

export function rangeStart(range: WeightRange, today: string) {
  return range === "all" ? null : addDays(today, -(Number(range) - 1));
}

// `rows` must include the 6 days before the range start so the first averages are complete.
export function weightView(rows: Row[], range: WeightRange, today: string): WeightView {
  const start = rangeStart(range, today) ?? rows[0]?.date ?? today;
  const points = rows.filter((r) => r.date >= start).map((r) => ({ ...r, avg: movingAvg(rows, r.date)! }));
  const todayWeight = rows.find((r) => r.date === today)?.weight ?? null;
  if (!points.length) return { range, todayWeight, headline: null, chart: null };

  const first = points[0];
  const last = points[points.length - 1];
  const change = Math.round((last.avg - first.avg) * 10) / 10; // trend change, so one noisy day doesn't skew it

  const values = points.flatMap((p) => [p.weight, p.avg]);
  const pad = Math.max((Math.max(...values) - Math.min(...values)) * 0.15, 1);
  const lo = Math.min(...values) - pad;
  const hi = Math.max(...values) + pad;
  const span = Math.max(daysBetween(start, today), 1);
  const pt = (date: string, v: number) => ({ x: daysBetween(start, date) / span, y: (hi - v) / (hi - lo) });

  return {
    range,
    todayWeight,
    headline: {
      weight: `${fmt(last.weight)} ${WEIGHT_UNIT}`,
      change: `${fmt(Math.abs(change))} ${WEIGHT_UNIT}`,
      direction: change > 0 ? "up" : change < 0 ? "down" : null,
      period: PERIODS[range],
    },
    chart: {
      dots: points.map((p) => pt(p.date, p.weight)),
      avg: points.map((p) => pt(p.date, p.avg)),
      yLabels: [hi, (hi + lo) / 2, lo].map((v) => ({ y: (hi - v) / (hi - lo), label: v.toFixed(0) })),
      xLabels: [format(start, { month: "short", day: "numeric" }), "Today"],
    },
  };
}
