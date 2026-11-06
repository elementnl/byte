import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_PATHS } from "@/constants";
import { sessionClient } from "@/server/supabase";

// Refreshes the Supabase session cookie and auth-gates every page and API route.
export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const supabase = sessionClient({
    getAll: () => req.cookies.getAll(),
    setAll: (list) => {
      list.forEach(({ name, value }) => req.cookies.set(name, value));
      res = NextResponse.next({ request: req });
      list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
    },
  });
  const { data } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;

  if (!data.user && !PUBLIC_PATHS.includes(path)) {
    return path.startsWith("/api/")
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
  }
  if (data.user && path === "/login") return NextResponse.redirect(new URL("/", req.url));
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon|apple-icon|manifest.webmanifest).*)"],
};
