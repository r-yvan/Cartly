"use client";

import * as React from "react";
import { api } from "@/lib/fetcher";

/** Loads JSON from the app's API and exposes loading, error and reload. */
export function useApi<T>(url: string) {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    try {
      setData(await api<T>(url));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}
