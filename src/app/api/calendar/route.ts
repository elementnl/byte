import { NextResponse } from "next/server";
import { context, fail } from "@/server/http";
import { calendar, monthRange } from "@/server/log";
import { db } from "@/server/supabase";

// GET /api/calendar?month=YYYY-MM (defaults to current month)
export async function GET(req: Request) {
  const { user, today } = await context(req);
  if (!user) return fail("Unauthorized", 401);

  const month = new URL(req.url).searchParams.get("month") ?? today.slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month > today.slice(0, 7)) return fail("Invalid month.");

  const { from, to } = monthRange(month);
  const { data, error } = await db()
    .from("byte_entries")
    .select("date")
    .eq("user_id", user.id)
    .gte("date", from)
    .lte("date", to);
  if (error) return fail("Couldn't load the calendar.", 500);

  return NextResponse.json(calendar(month, today, new Set((data ?? []).map((r) => r.date as string))));
}
