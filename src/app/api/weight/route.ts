import { NextResponse } from "next/server";
import { WEIGHT_RANGES, type WeightRange } from "@/constants";
import { body, context, fail } from "@/server/http";
import { addDays, isDate } from "@/server/dates";
import { db } from "@/server/supabase";
import { parseWeight } from "@/server/validate";
import { fetchWeights, rangeStart, weightView } from "@/server/weight";

// GET /api/weight?range=7|30|90|all
export async function GET(req: Request) {
  const { user, today } = await context(req);
  if (!user) return fail("Unauthorized", 401);

  const range = (new URL(req.url).searchParams.get("range") ?? "30") as WeightRange;
  if (!WEIGHT_RANGES.includes(range)) return fail("Invalid range.");

  const start = rangeStart(range, today);
  try {
    const rows = await fetchWeights(user.id, start && addDays(start, -6), today);
    return NextResponse.json(weightView(rows, range, today));
  } catch {
    return fail("Couldn't load your weight.", 500);
  }
}

// PUT /api/weight { date?, weight } — one weigh-in per day (default today), replaces any existing.
export async function PUT(req: Request) {
  const { user, today } = await context(req);
  if (!user) return fail("Unauthorized", 401);

  const b = await body(req);
  const date = b.date ?? today;
  const weight = parseWeight(b.weight);
  if (!isDate(date) || date > today) return fail("Invalid date.");
  if (weight === null) return fail("Enter your weight.");

  const { error } = await db().from("byte_weights").upsert({ user_id: user.id, date, weight });
  if (error) return fail("Couldn't save your weight.", 500);
  return NextResponse.json({ ok: true });
}

// DELETE /api/weight?date=YYYY-MM-DD (default today)
export async function DELETE(req: Request) {
  const { user, today } = await context(req);
  if (!user) return fail("Unauthorized", 401);

  const date = new URL(req.url).searchParams.get("date") || today;
  if (!isDate(date)) return fail("Invalid date.");

  const { error } = await db().from("byte_weights").delete().eq("user_id", user.id).eq("date", date);
  if (error) return fail("Couldn't delete that weigh-in.", 500);
  return NextResponse.json({ ok: true });
}
