import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, ProductImage, StatusBadge } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/utils";

export type BuyerOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  items: { id: string; quantity: number; product: { name: string; images: { url: string }[] } }[];
};

export function OrderRow({ order }: { order: BuyerOrder }) {
  const units = order.items.reduce((n, i) => n + i.quantity, 0);
  return (
    <Link href={`/orders/${order.id}`} className="group block">
      <Card className="flex items-center gap-4 p-4 transition-colors group-hover:border-foreground/30 md:p-5">
        <div className="flex -space-x-5">
          {order.items.slice(0, 3).map((item) => (
            <ProductImage key={item.id} src={item.product.images[0]?.url} alt="" className="size-14 rounded-xl border-2 border-card md:size-16" />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-black tracking-tight">{order.orderNumber}</p>
          <p className="truncate text-sm text-muted-foreground">
            {formatDate(order.createdAt)} · {units} {units === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <p className="font-black">{formatPrice(order.total)}</p>
          <StatusBadge status={order.status} />
        </div>
        <ChevronRight className="hidden size-5 text-muted-foreground transition-transform group-hover:translate-x-1 sm:block" />
      </Card>
    </Link>
  );
}
