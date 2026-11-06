import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = () => process.env.SUPABASE_URL!;
const key = () => process.env.SUPABASE_SECRET_KEY!;

// Session-aware client: only used for auth (sign in/out, reading the user from cookies).
export function sessionClient(cookieMethods: CookieMethodsServer) {
  return createServerClient(url(), key(), { cookies: cookieMethods });
}

export async function authClient() {
  const store = await cookies();
  return sessionClient({
    getAll: () => store.getAll(),
    setAll: (list) => {
      try {
        list.forEach(({ name, value, options }) => store.set(name, value, options));
      } catch {
        // Called from a Server Component (read-only cookies); the proxy refreshes sessions.
      }
    },
  });
}

export async function currentUser() {
  const { data } = await (await authClient()).auth.getUser();
  return data.user;
}

// Data client: secret key, no session. Every query must filter by user_id.
export function db() {
  return createClient(url(), key(), { auth: { persistSession: false, autoRefreshToken: false } });
}
