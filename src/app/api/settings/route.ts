import { NextResponse } from "next/server";
import { LIMITS, THEMES, type Theme } from "@/constants";
import { body, context, fail } from "@/server/http";
import { getSettings } from "@/server/settings";
import { parseGoal } from "@/server/validate";
import { db } from "@/server/supabase";

export async function GET(req: Request) {
  const { user } = await context(req);
  if (!user) return fail("Unauthorized", 401);
  return NextResponse.json(await getSettings(user.id));
}

// PUT /api/settings { calorieGoal?, proteinGoal?, theme? } — only provided fields change.
export async function PUT(req: Request) {
  const { user } = await context(req);
  if (!user) return fail("Unauthorized", 401);
  const b = await body(req);
  const row: Record<string, unknown> = { user_id: user.id, updated_at: new Date().toISOString() };

  if ("calorieGoal" in b) {
    const v = parseGoal(b.calorieGoal, LIMITS.calories);
    if (v === undefined) return fail("Calorie goal must be a positive number.");
    row.calorie_goal = v;
  }
  if ("proteinGoal" in b) {
    const v = parseGoal(b.proteinGoal, LIMITS.protein);
    if (v === undefined) return fail("Protein goal must be a positive number.");
    row.protein_goal = v;
  }
  if ("theme" in b) {
    if (!THEMES.includes(b.theme as Theme)) return fail("Invalid theme.");
    row.theme = b.theme;
  }

  const { error } = await db().from("byte_settings").upsert(row);
  if (error) return fail("Couldn't save settings.", 500);
  return NextResponse.json(await getSettings(user.id));
}
