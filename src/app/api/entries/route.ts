import { NextResponse } from "next/server";
import { body, context, fail } from "@/server/http";
import { isDate } from "@/server/dates";
import { parseEntry } from "@/server/validate";
import { db } from "@/server/supabase";

// POST /api/entries { date, name, protein, calories }
export async function POST(req: Request) {
  const { user, today } = await context(req);
  if (!user) return fail("Unauthorized", 401);

  const b = await body(req);
  if (!isDate(b.date) || b.date > today) return fail("Invalid date.");
  const entry = parseEntry(b);
  if (typeof entry === "string") return fail(entry);

  const { error } = await db().from("byte_entries").insert({ ...entry, date: b.date, user_id: user.id });
  if (error) return fail("Couldn't save that entry.", 500);
  return NextResponse.json({ ok: true }, { status: 201 });
}
