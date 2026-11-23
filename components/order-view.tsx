import { Check } from "lucide-react";
import { Card, ProductImage, StatusBadge } from "@/components/ui";
import { cn, formatDate, formatPrice, statusLabel } from "@/lib/utils";

const STEPS = ["PENDING", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;
// IN_TRANSIT sits between shipped and out for delivery, so it shares the "shipped" step.
const stepIndex = (status: string) => (status === "IN_TRANSIT" ? 2 : STEPS.indexOf(status as (typeof STEPS)[number]));

export function OrderProgress({ status }: { status: string }) {
  if (status === "CANCELLED" || stepIndex(status) === -1) return <StatusBadge status={status} />;
  const current = stepIndex(status);
  return (
    <ol className="grid grid-cols-5">
      {STEPS.map((step, i) => (
        <li key={step} className="relative flex flex-col items-center gap-2 text-center">
          {i > 0 && <span aria-hidden className={cn("absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2", i <= current ? "bg-foreground" : "bg-border")} />}
          <span
            className={cn(
              "relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-xs font-black",
              i < current && "border-foreground bg-foreground text-background",
              i === current && "border-brand bg-brand text-brand-foreground",
              i > current && "border-border bg-background text-muted-foreground"
            )}
          >
            {i < current ? <Check className="size-4" /> : i + 1}
          </span>
          <span className={cn("text-xs font-bold sm:text-sm", i > current && "text-muted-foreground")}>{statusLabel(step)}</span>
        </li>
      ))}
    </ol>
  );
}

type Address = Partial<Record<"firstName" | "lastName" | "address1" | "address2" | "city" | "state" | "postalCode" | "country" | "phone", string>>;

export type OrderViewData = {
  status: string;
  subtotal: unknown;
  shipping: unknown;
  total: unknown;
  paymentStatus: string;
  estimatedDelivery: Date | string | null;
  shippingAddress: unknown;
  trackingNumber: string | null;
  trackingCompany: string | null;
  items: { id: string; quantity: number; price: unknown; product: { name: string; images: { url: string }[] } }[];
  tracking: { updates: { id: string; status: string; description: string | null; timestamp: Date | string }[] } | null;
};

export function OrderView({ order }: { order: OrderViewData }) {
  const address = (order.shippingAddress ?? {}) as Address;
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <Card className="p-6 md:p-8">
          <OrderProgress status={order.status} />
          {order.estimatedDelivery && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <p className="mt-6 rounded-2xl bg-muted px-4 py-3 text-center font-medium">
              Estimated delivery <span className="font-black">{formatDate(order.estimatedDelivery)}</span>
            </p>
          )}
        </Card>

        {order.tracking && order.tracking.updates.length > 0 && (
          <Card className="p-6 md:p-8">
            <h2 className="text-2xl font-black">Timeline</h2>
            <ol className="mt-6">
              {order.tracking.updates.map((update, i) => (
                <li key={update.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < order.tracking!.updates.length - 1 && <span aria-hidden className="absolute left-[5px] top-4 h-full w-0.5 bg-border" />}
                  <span className={cn("relative mt-1.5 size-3 shrink-0 rounded-full", i === 0 ? "bg-brand ring-4 ring-brand/25" : "bg-border")} />
                  <div>
                    <p className="font-bold">{statusLabel(update.status)}</p>
                    {update.description && <p className="text-muted-foreground">{update.description}</p>}
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {new Date(update.timestamp).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        )}

        <Card className="p-6 md:p-8">
          <h2 className="text-2xl font-black">Items</h2>
          <ul className="mt-5 divide-y">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <ProductImage src={item.product.images[0]?.url} alt="" className="size-16 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">Qty {item.quantity} · {formatPrice(item.price)} each</p>
                </div>
                <p className="font-black">{formatPrice(Number(item.price) * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="space-y-6 lg:sticky lg:top-24">
        <Card className="p-6">
          <h2 className="text-xl font-black">Payment</h2>
          <dl className="mt-4 space-y-2.5">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-bold">{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="font-bold">{Number(order.shipping) === 0 ? "Free" : formatPrice(order.shipping)}</dd></div>
            <div className="flex items-baseline justify-between border-t pt-3"><dt className="font-black">Total</dt><dd className="text-2xl font-black tracking-tightest">{formatPrice(order.total)}</dd></div>
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">
            {order.paymentStatus === "PAID" ? "Paid on delivery." : "Pay on delivery. Nothing has been charged."}
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-black">Delivering to</h2>
          <address className="mt-3 not-italic text-muted-foreground">
            <span className="font-bold text-foreground">{address.firstName} {address.lastName}</span><br />
            {address.address1}{address.address2 ? `, ${address.address2}` : ""}<br />
            {[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}<br />
            {address.country}<br />
            {address.phone}
          </address>
          {order.trackingNumber && (
            <p className="mt-4 border-t pt-4 text-sm">
              <span className="text-muted-foreground">{order.trackingCompany ?? "Tracking"} · </span>
              <span className="font-bold">{order.trackingNumber}</span>
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
