import { NextResponse } from "next/server";
import { body, context, fail } from "@/server/http";
import { parseEntry } from "@/server/validate";
import { db } from "@/server/supabase";

// PATCH /api/entries/:id { name, protein, calories }
export async function PATCH(req: Request, ctx: RouteContext<"/api/entries/[id]">) {
  const { user } = await context(req);
  if (!user) return fail("Unauthorized", 401);
  const { id } = await ctx.params;

  const entry = parseEntry(await body(req));
  if (typeof entry === "string") return fail(entry);

  const { data, error } = await db()
    .from("byte_entries")
    .update(entry)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");
  if (error) return fail("Couldn't update that entry.", 500);
  if (!data.length) return fail("Entry not found.", 404);
  return NextResponse.json({ ok: true });
}

// DELETE /api/entries/:id
export async function DELETE(req: Request, ctx: RouteContext<"/api/entries/[id]">) {
  const { user } = await context(req);
  if (!user) return fail("Unauthorized", 401);
  const { id } = await ctx.params;

  const { error } = await db().from("byte_entries").delete().eq("id", id).eq("user_id", user.id);
  if (error) return fail("Couldn't delete that entry.", 500);
  return NextResponse.json({ ok: true });
}
