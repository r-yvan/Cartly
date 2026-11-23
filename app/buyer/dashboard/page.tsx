"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Package, Store, Truck, Wallet } from "lucide-react";
import { LoadState, PageHeader, StatCard } from "@/components/dashboard";
import { OrderRow, type BuyerOrder } from "@/components/order-row";
import { buttonVariants, Card, EmptyState } from "@/components/ui";
import { useApi } from "@/lib/use-api";
import { cn, formatPrice } from "@/lib/utils";

const DONE = ["DELIVERED", "CANCELLED", "REFUNDED", "FAILED"];

export default function BuyerDashboard() {
  const { data: session } = useSession();
  const { data: orders, loading, error, reload } = useApi<BuyerOrder[]>("/api/buyer/orders");
  const firstName = session?.user?.name?.split(" ")[0];
  const isSeller = session?.user?.role === "SELLER" || session?.user?.role === "ADMIN";

  return (
    <>
      <PageHeader
        eyebrow="My account"
        title={firstName ? `Hi, ${firstName}.` : "Welcome."}
        action={<Link href="/products" className={buttonVariants()}>Keep shopping <ArrowRight /></Link>}
      />
      <LoadState loading={loading} error={error} onRetry={reload} />
      {orders && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Orders placed" value={orders.length} icon={Package} />
            <StatCard label="On the way" value={orders.filter((o) => !DONE.includes(o.status)).length} icon={Truck} highlight />
            <StatCard
              label="Total spent"
              value={formatPrice(orders.filter((o) => o.status !== "CANCELLED").reduce((sum, o) => sum + Number(o.total), 0))}
              icon={Wallet}
            />
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">Recent orders</h2>
              {orders.length > 3 && <Link href="/buyer/orders" className="font-bold underline underline-offset-4">See all</Link>}
            </div>
            {orders.length === 0 ? (
              <EmptyState icon={<Package />} title="No orders yet" description="When you buy something, you'll be able to follow it here." action={<Link href="/products" className={buttonVariants()}>Browse products</Link>} />
            ) : (
              <div className="space-y-3">{orders.slice(0, 3).map((order) => <OrderRow key={order.id} order={order} />)}</div>
            )}
          </section>

          {!isSeller && (
            <Card className="flex flex-wrap items-center justify-between gap-5 p-6 md:p-8">
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-muted"><Store className="size-5" /></span>
                <div>
                  <h2 className="text-xl font-black">Have something to sell?</h2>
                  <p className="text-muted-foreground">Open a store on Cartly in about two minutes.</p>
                </div>
              </div>
              <Link href="/seller/register" className={cn(buttonVariants({ variant: "outline" }))}>Start selling</Link>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
