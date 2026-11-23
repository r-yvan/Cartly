"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

type Point = { date: string; revenue: number; orders: number };

const dayLabel = (iso: string, long = false) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", long ? { weekday: "long", month: "short", day: "numeric" } : { weekday: "short" });

const compact = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl border bg-popover px-3.5 py-2.5 shadow-lift">
      <p className="text-xs text-muted-foreground">{dayLabel(point.date, true)}</p>
      <p className="text-lg font-black tracking-tighter">{formatPrice(point.revenue)}</p>
      <p className="text-xs text-muted-foreground">{point.orders} {point.orders === 1 ? "order" : "orders"}</p>
    </div>
  );
}

/** Revenue for the last seven days. One series, so the title names it and there is no legend. */
export function RevenueChart({ data, title = "Revenue, last 7 days" }: { data: Point[]; title?: string }) {
  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  const orders = data.reduce((sum, d) => sum + d.orders, 0);

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-muted-foreground">{title}</h2>
          <p className="mt-1 text-4xl font-black tracking-tightest">{formatPrice(total)}</p>
        </div>
        <p className="text-sm text-muted-foreground">{orders} {orders === 1 ? "order" : "orders"}</p>
      </div>

      {total === 0 ? (
        <p className="mt-6 flex h-56 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          No sales in the last 7 days yet.
        </p>
      ) : (
        <div className="mt-6 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tickFormatter={(d) => dayLabel(d)} axisLine={false} tickLine={false} tickMargin={10} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis width={52} axisLine={false} tickLine={false} tickCount={4} tickFormatter={(v) => compact.format(v)} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", radius: 8 }} />
              <Bar dataKey="revenue" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table view of the same data for screen readers. */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead><tr><th>Day</th><th>Revenue</th><th>Orders</th></tr></thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}><td>{dayLabel(d.date, true)}</td><td>{formatPrice(d.revenue)}</td><td>{d.orders}</td></tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
