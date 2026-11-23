"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { LoadState, PageHeader } from "@/components/dashboard";
import { OrderRow, type BuyerOrder } from "@/components/order-row";
import { buttonVariants, EmptyState } from "@/components/ui";
import { useApi } from "@/lib/use-api";

export default function BuyerOrders() {
  const { data: orders, loading, error, reload } = useApi<BuyerOrder[]>("/api/buyer/orders");
  return (
    <>
      <PageHeader eyebrow="My account" title="Orders" />
      <LoadState loading={loading} error={error} onRetry={reload} />
      {orders &&
        (orders.length === 0 ? (
          <EmptyState icon={<Package />} title="No orders yet" description="When you buy something, you'll be able to follow it here." action={<Link href="/products" className={buttonVariants()}>Browse products</Link>} />
        ) : (
          <div className="space-y-3">{orders.map((order) => <OrderRow key={order.id} order={order} />)}</div>
        ))}
    </>
  );
}
