export const LIMITS = {
  name: 100,
  protein: 1000,
  calories: 20000,
} as const;

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

// Routes reachable without a session.
export const PUBLIC_PATHS = ["/login", "/api/auth/login"];

export const WEIGHT_UNIT = "lbs"; // ponytail: lb only; add a settings toggle if kg is ever needed
export const WEIGHT_RANGES = ["7", "30", "90", "all"] as const;
export type WeightRange = (typeof WEIGHT_RANGES)[number];
