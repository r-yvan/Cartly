"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { LoadState, PageHeader } from "@/components/dashboard";
import { Card, EmptyState, ProductImage, Select, StatusBadge } from "@/components/ui";
import { api } from "@/lib/fetcher";
import { useApi } from "@/lib/use-api";
import { formatDate, formatPrice, ORDER_STATUSES, statusLabel } from "@/lib/utils";

type SellerOrder = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  customerNote: string | null;
  shippingAddress: Record<string, string> | null;
  user: { name: string | null; email: string | null };
  items: { id: string; quantity: number; price: string; product: { name: string; images: { url: string }[] } }[];
};

const CLOSED = ["DELIVERED", "CANCELLED"];

export default function SellerOrders() {
  const { data: orders, loading, error, reload } = useApi<SellerOrder[]>("/api/seller/orders");
  const [updating, setUpdating] = React.useState<string | null>(null);

  const setStatus = async (order: SellerOrder, status: string) => {
    if (status === "CANCELLED" && !window.confirm(`Cancel order ${order.orderNumber}? The buyer will see it as cancelled.`)) return;
    setUpdating(order.id);
    try {
      await api("/api/seller/orders", { method: "PUT", body: { orderId: order.id, status } });
      toast.success(`${order.orderNumber} marked as ${statusLabel(status).toLowerCase()}`);
      await reload();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Seller hub" title="Orders" />
      <LoadState loading={loading} error={error} onRetry={reload} />
      {orders &&
        (orders.length === 0 ? (
          <EmptyState icon={<ShoppingCart />} title="No orders yet" description="When someone buys one of your products, the order shows up here." />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const a = order.shippingAddress ?? {};
              const total = order.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
              return (
                <Card key={order.id} className="p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-black">{order.orderNumber}</h2>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(order.createdAt)} · {order.user.name ?? order.user.email ?? "Customer"}
                      </p>
                    </div>
                    {CLOSED.includes(order.status) ? (
                      <p className="text-2xl font-black tracking-tightest">{formatPrice(total)}</p>
                    ) : (
                      <div className="relative w-52">
                        <Select value={order.status} disabled={updating === order.id} onChange={(e) => setStatus(order, e.target.value)} aria-label={`Status of ${order.orderNumber}`} className="h-11 rounded-full font-bold">
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                        </Select>
                      </div>
                    )}
                  </div>

                  <ul className="mt-5 divide-y border-y">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 py-3">
                        <ProductImage src={item.product.images[0]?.url} alt="" className="size-12 rounded-xl" />
                        <p className="min-w-0 flex-1 truncate font-bold">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">× {item.quantity}</p>
                        <p className="w-20 text-right font-bold">{formatPrice(Number(item.price) * item.quantity)}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="eyebrow">Ship to</p>
                      <p className="mt-1.5 font-bold">{a.firstName} {a.lastName}</p>
                      <p className="text-muted-foreground">
                        {[a.address1, a.address2, a.city, a.state, a.postalCode, a.country].filter(Boolean).join(", ")}
                      </p>
                      {a.phone && <p className="text-muted-foreground">{a.phone}</p>}
                    </div>
                    {order.customerNote && (
                      <div>
                        <p className="eyebrow">Note from buyer</p>
                        <p className="mt-1.5 text-muted-foreground">{order.customerNote}</p>
                      </div>
                    )}
                  </div>
                  {!CLOSED.includes(order.status) && (
                    <p className="mt-4 text-right text-sm text-muted-foreground">
                      Collect on delivery: <span className="text-lg font-black text-foreground">{formatPrice(total)}</span>
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        ))}
    </>
  );
}
