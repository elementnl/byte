import { NextResponse } from "next/server";
import { currentUser } from "./supabase";
import { todayIn } from "./dates";

export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

// Resolves the signed-in user plus their local "today" (client sends its IANA zone in x-tz).
export async function context(req: Request) {
  const user = await currentUser();
  return { user, today: todayIn(req.headers.get("x-tz")) };
}

export async function body(req: Request): Promise<Record<string, unknown>> {
  try {
    const json = await req.json();
    return json && typeof json === "object" ? json : {};
  } catch {
    return {};
  }
}
