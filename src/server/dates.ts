// All dates are plain "YYYY-MM-DD" strings in the user's local calendar.

export function todayIn(tz: string | null) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz ?? undefined }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-CA").format(new Date());
  }
}

export function isDate(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && toUTC(s).toISOString().startsWith(s);
}

export function addDays(date: string, n: number) {
  const d = toUTC(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function addMonths(month: string, n: number) {
  const d = toUTC(`${month}-01`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 7);
}

export function format(date: string, opts: Intl.DateTimeFormatOptions) {
  return toUTC(date).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}

export function toUTC(date: string) {
  return new Date(`${date}T00:00:00Z`);
}
