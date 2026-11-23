import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, PartyPopper } from "lucide-react";
import { getSession } from "@/lib/api";
import { getBuyerOrder } from "@/lib/orders";
import { OrderView } from "@/components/order-view";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> };

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ id }, { placed }, session] = await Promise.all([params, searchParams, getSession()]);
  if (!session) redirect(`/auth/signin?callbackUrl=/orders/${id}`);

  const order = await getBuyerOrder(id, session.user.id);
  if (!order) notFound();

  return (
    <div className="container pt-10 lg:pt-14">
      <Link href="/buyer/orders" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All orders
      </Link>

      {placed && (
        <div className="mt-6 flex items-center gap-4 rounded-3xl bg-brand p-5 text-brand-foreground md:p-6">
          <PartyPopper className="size-8 shrink-0" />
          <div>
            <p className="text-xl font-black tracking-tighter">Order placed. Thank you!</p>
            <p className="font-medium opacity-80">The seller has been notified. You can follow every step from this page.</p>
          </div>
        </div>
      )}

      <p className="eyebrow mt-8">Placed {formatDate(order.createdAt)}</p>
      <h1 className="display mt-2 text-5xl md:text-7xl">Order {order.orderNumber}</h1>

      <div className="mt-10">
        <OrderView order={order} />
      </div>
    </div>
  );
}
