import { NextResponse } from "next/server";
import type { Day, Entry } from "@/lib/types";
import { context, fail } from "@/server/http";
import { isDate } from "@/server/dates";
import { dayMeta, meter, totals } from "@/server/log";
import { getSettings } from "@/server/settings";
import { db } from "@/server/supabase";

// GET /api/day?date=YYYY-MM-DD (defaults to today)
export async function GET(req: Request) {
  const { user, today } = await context(req);
  if (!user) return fail("Unauthorized", 401);

  const param = new URL(req.url).searchParams.get("date");
  const date = param ?? today;
  if (!isDate(date)) return fail("Invalid date.");
  if (date > today) return fail("Can't view future days.");

  const [{ data, error }, settings] = await Promise.all([
    db()
      .from("byte_entries")
      .select("id, name, protein, calories")
      .eq("user_id", user.id)
      .eq("date", date)
      .order("created_at"),
    getSettings(user.id),
  ]);
  if (error) return fail("Couldn't load your log.", 500);

  const entries = (data ?? []).map((e) => ({ ...e, protein: Number(e.protein) })) as Entry[];
  const t = totals(entries);
  const day: Day = {
    date,
    ...dayMeta(date, today),
    entries,
    meters: [meter("calories", t.calories, settings.calorieGoal), meter("protein", t.protein, settings.proteinGoal)],
  };
  return NextResponse.json(day);
}
