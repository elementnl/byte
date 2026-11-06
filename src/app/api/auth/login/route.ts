import { NextResponse } from "next/server";
import { authClient } from "@/server/supabase";
import { body, fail } from "@/server/http";

export async function POST(req: Request) {
  const { email, password } = await body(req);
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return fail("Enter your email and password.");
  }
  const { error } = await (await authClient()).auth.signInWithPassword({ email: email.trim(), password });
  if (error) return fail("Incorrect email or password.", 401);
  return NextResponse.json({ ok: true });
}
