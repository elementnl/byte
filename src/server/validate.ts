import { LIMITS } from "@/constants";

const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);

type EntryInput = { name: string; protein: number; calories: number };

// Returns the cleaned entry or an error message.
export function parseEntry(b: Record<string, unknown>): EntryInput | string {
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const protein = Math.round(num(b.protein) * 10) / 10;
  const calories = Math.round(num(b.calories));
  if (!name) return "Enter what you ate.";
  if (name.length > LIMITS.name) return `Keep the name under ${LIMITS.name} characters.`;
  if (!(protein >= 0 && protein <= LIMITS.protein)) return "Enter protein in grams.";
  if (!(calories >= 0 && calories <= LIMITS.calories)) return "Enter calories.";
  return { name, protein, calories };
}

// Goal: positive whole number, or null/"" to clear. undefined = invalid.
export function parseGoal(v: unknown, max: number): number | null | undefined {
  if (v === null || v === "") return null;
  const n = Math.round(num(v));
  return n > 0 && n <= max ? n : undefined;
}

// Weight in lb, one decimal. null = invalid.
export function parseWeight(v: unknown): number | null {
  const w = Math.round(num(v) * 10) / 10;
  return w > 0 && w < 1000 ? w : null;
}
