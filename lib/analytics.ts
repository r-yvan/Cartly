/** Buckets rows into the last `days` calendar days (oldest first). */
export function seriesByDay<T extends { createdAt: Date }>(
  rows: T[],
  revenueOf: (row: T) => number,
  days = 7
) {
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const dayRows = rows.filter((r) => r.createdAt >= start && r.createdAt < end);
    series.push({
      date: start.toISOString().split("T")[0],
      revenue: dayRows.reduce((sum, r) => sum + revenueOf(r), 0),
      orders: dayRows.length,
    });
  }
  return series;
}

export function periodStart(request: Request) {
  const raw = Number(new URL(request.url).searchParams.get("period"));
  const days = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 365) : 30;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return start;
}
