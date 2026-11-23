import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";

export function SummaryRows({ subtotal, shipping, total }: { subtotal: number; shipping: number; total: number }) {
  return (
    <dl className="space-y-3">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="font-bold">{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Shipping</dt>
        <dd className="font-bold">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
      </div>
      {shipping > 0 && (
        <p className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
          Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.
        </p>
      )}
      <div className="flex items-baseline justify-between border-t pt-4">
        <dt className="text-lg font-black">Total</dt>
        <dd className="text-3xl font-black tracking-tightest">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}
