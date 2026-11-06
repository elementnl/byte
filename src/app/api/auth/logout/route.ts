import { NextResponse } from "next/server";
import { authClient } from "@/server/supabase";

export async function POST() {
  await (await authClient()).auth.signOut();
  return NextResponse.json({ ok: true });
}
