import type { Settings } from "@/lib/types";
import { db } from "./supabase";

export async function getSettings(userId: string): Promise<Settings> {
  const { data } = await db()
    .from("byte_settings")
    .select("calorie_goal, protein_goal, theme")
    .eq("user_id", userId)
    .maybeSingle();
  return {
    calorieGoal: data?.calorie_goal ?? null,
    proteinGoal: data?.protein_goal ?? null,
    theme: data?.theme ?? "light",
  };
}
