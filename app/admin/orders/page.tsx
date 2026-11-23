"use client";

import { ShoppingCart } from "lucide-react";
import { LoadState, PageHeader, TableCard } from "@/components/dashboard";
import { EmptyState, StatusBadge } from "@/components/ui";
import { useApi } from "@/lib/use-api";
import { formatDate, formatPrice } from "@/lib/utils";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
  user: { name: string | null; email: string | null };
  _count: { items: number };
};

export default function AdminOrders() {
  const { data: orders, loading, error, reload } = useApi<Order[]>("/api/admin/orders");
  return (
    <>
      <PageHeader eyebrow="Admin" title="Orders" />
      <LoadState loading={loading} error={error} onRetry={reload} />
      {orders &&
        (orders.length === 0 ? (
          <EmptyState icon={<ShoppingCart />} title="No orders yet" description="Every order placed on the platform will be listed here." />
        ) : (
          <TableCard head={["Order", "Customer", "Placed", "Items", "Payment", "Status", "Total"]}>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="whitespace-nowrap font-black">{order.orderNumber}</td>
                <td className="max-w-48 truncate text-muted-foreground">{order.user.name ?? order.user.email}</td>
                <td className="whitespace-nowrap text-muted-foreground">{formatDate(order.createdAt)}</td>
                <td>{order._count.items}</td>
                <td><StatusBadge status={order.paymentStatus} /></td>
                <td><StatusBadge status={order.status} /></td>
                <td className="font-black">{formatPrice(order.total)}</td>
              </tr>
            ))}
          </TableCard>
        ))}
    </>
  );
}
