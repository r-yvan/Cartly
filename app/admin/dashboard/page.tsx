"use client";

import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { LoadState, PageHeader, StatCard } from "@/components/dashboard";
import { RevenueChart } from "@/components/revenue-chart";
import { Card, StatusBadge } from "@/components/ui";
import { useApi } from "@/lib/use-api";
import { formatPrice } from "@/lib/utils";

type Analytics = {
  totalUsers: number;
  newUsers: number;
  totalSellers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  recentOrders: number;
  totalRevenue: number;
  collectedRevenue: number;
  ordersByStatus: { status: string; _count: number }[];
  revenueByDay: { date: string; revenue: number; orders: number }[];
};

export default function AdminDashboard() {
  const { data, loading, error, reload } = useApi<Analytics>("/api/admin/analytics");
  const statusTotal = data?.ordersByStatus.reduce((n, s) => n + s._count, 0) ?? 0;

  return (
    <>
      <PageHeader eyebrow="Admin" title="Platform" />
      <LoadState loading={loading} error={error} onRetry={reload} />
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Order value, 30 days" value={formatPrice(data.totalRevenue)} hint={`${formatPrice(data.collectedRevenue)} collected so far`} icon={DollarSign} highlight />
            <StatCard label="Orders, 30 days" value={data.recentOrders} hint={`${data.totalOrders} all time`} icon={ShoppingCart} />
            <StatCard label="Users" value={data.totalUsers} hint={`${data.newUsers} new · ${data.totalSellers} sellers`} icon={Users} />
            <StatCard label="Live products" value={data.activeProducts} hint={`${data.totalProducts} in total`} icon={Package} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <RevenueChart data={data.revenueByDay} title="Order value, last 7 days" />
            <Card className="p-6">
              <h2 className="text-sm font-bold text-muted-foreground">Orders by status, 30 days</h2>
              {statusTotal === 0 ? (
                <p className="mt-6 text-muted-foreground">No orders in this period yet.</p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {data.ordersByStatus
                    .sort((a, b) => b._count - a._count)
                    .map(({ status, _count }) => (
                      <li key={status}>
                        <div className="flex items-center justify-between">
                          <StatusBadge status={status} />
                          <span className="font-black tabular-nums">{_count}</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-foreground" style={{ width: `${(_count / statusTotal) * 100}%` }} />
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
