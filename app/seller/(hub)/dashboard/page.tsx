"use client";

import Link from "next/link";
import { AlertTriangle, Clock, DollarSign, Package, Plus, ShoppingCart } from "lucide-react";
import { LoadState, PageHeader, StatCard } from "@/components/dashboard";
import { RevenueChart } from "@/components/revenue-chart";
import { buttonVariants, Card, ProductImage } from "@/components/ui";
import { useApi } from "@/lib/use-api";
import { formatPrice } from "@/lib/utils";

type Analytics = {
  store: { name: string } | null;
  totalProducts: number;
  activeProducts: number;
  lowStock: number;
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  topProducts: { id: string; name: string; price: string; quantity: number; images: { url: string }[]; _count: { orderItems: number } }[];
  salesByDay: { date: string; revenue: number; orders: number }[];
};

export default function SellerDashboard() {
  const { data, loading, error, reload } = useApi<Analytics>("/api/seller/analytics");
  return (
    <>
      <PageHeader
        eyebrow="Seller hub"
        title={data?.store?.name ?? "Overview"}
        action={<Link href="/seller/products?new=1" className={buttonVariants({ variant: "brand" })}><Plus /> Add product</Link>}
      />
      <LoadState loading={loading} error={error} onRetry={reload} />
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Revenue, 30 days" value={formatPrice(data.totalRevenue)} icon={DollarSign} highlight />
            <StatCard label="Orders, 30 days" value={data.totalOrders} icon={ShoppingCart} />
            <StatCard label="Waiting on you" value={data.pendingOrders} hint={data.pendingOrders ? "Confirm these to keep buyers happy" : "All caught up"} icon={Clock} />
            <StatCard label="Live products" value={data.activeProducts} hint={`${data.totalProducts} in total`} icon={Package} />
          </div>

          {data.lowStock > 0 && (
            <Link href="/seller/products" className="flex items-center gap-3 rounded-2xl bg-warning/10 px-5 py-4 font-bold text-warning">
              <AlertTriangle className="size-5 shrink-0" />
              {data.lowStock} {data.lowStock === 1 ? "product is" : "products are"} running low on stock. Restock soon.
            </Link>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <RevenueChart data={data.salesByDay} />
            <Card className="p-6">
              <h2 className="text-sm font-bold text-muted-foreground">Best sellers</h2>
              {data.topProducts.length === 0 ? (
                <p className="mt-6 text-muted-foreground">List your first product to see it here.</p>
              ) : (
                <ol className="mt-4 divide-y">
                  {data.topProducts.map((product, i) => (
                    <li key={product.id} className="flex items-center gap-3 py-3 last:pb-0">
                      <span className="w-5 text-sm font-bold tabular-nums text-muted-foreground">{i + 1}</span>
                      <ProductImage src={product.images[0]?.url} alt="" className="size-11 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                      </div>
                      <p className="text-sm font-bold">{product._count.orderItems} sold</p>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
