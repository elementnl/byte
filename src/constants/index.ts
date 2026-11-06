export const LIMITS = {
  name: 100,
  protein: 1000,
  calories: 20000,
} as const;

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

// Routes reachable without a session.
export const PUBLIC_PATHS = ["/login", "/api/auth/login"];
