// Thin fetch wrapper for the client. Sends the device time zone so the server knows "today".
export async function api<T = unknown>(path: string, method = "GET", data?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: { "content-type": "application/json", "x-tz": Intl.DateTimeFormat().resolvedOptions().timeZone },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  if (res.status === 401 && path !== "/api/auth/login") {
    window.location.replace("/login");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
  return json as T;
}
