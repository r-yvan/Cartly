/** fetch wrapper for the app's JSON API: throws the server's error message on failure. */
export async function api<T = unknown>(input: string, init?: Omit<RequestInit, "body"> & { body?: unknown }) {
  const res = await fetch(input, {
    ...init,
    headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data as T;
}
