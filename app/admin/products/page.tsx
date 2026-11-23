"use client";

import { Package } from "lucide-react";
import { toast } from "sonner";
import { LoadState, PageHeader, TableCard } from "@/components/dashboard";
import { EmptyState, ProductImage, Select } from "@/components/ui";
import { api } from "@/lib/fetcher";
import { useApi } from "@/lib/use-api";
import { formatPrice, statusLabel } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  status: string;
  images: { url: string }[];
  category: { name: string } | null;
  seller: { name: string | null; email: string | null; store: { name: string } | null };
  _count: { orderItems: number };
};

const STATUSES = ["ACTIVE", "DRAFT", "OUT_OF_STOCK", "ARCHIVED"];

export default function AdminProducts() {
  const { data: products, loading, error, reload } = useApi<Product[]>("/api/admin/products");

  const setStatus = async (product: Product, status: string) => {
    try {
      await api("/api/admin/products", { method: "PUT", body: { id: product.id, status } });
      toast.success(`${product.name} is now ${statusLabel(status).toLowerCase()}`);
      reload();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Admin" title="Products" />
      <LoadState loading={loading} error={error} onRetry={reload} />
      {products &&
        (products.length === 0 ? (
          <EmptyState icon={<Package />} title="No products yet" description="Products listed by sellers will appear here for moderation." />
        ) : (
          <TableCard head={["Product", "Seller", "Price", "Stock", "Sold", "Status"]}>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <ProductImage src={product.images[0]?.url} alt="" className="size-12 shrink-0 rounded-xl" />
                    <div className="min-w-0">
                      <p className="max-w-52 truncate font-bold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category?.name ?? "No category"}</p>
                    </div>
                  </div>
                </td>
                <td className="max-w-40 truncate text-muted-foreground">{product.seller.store?.name ?? product.seller.name ?? product.seller.email}</td>
                <td className="font-bold">{formatPrice(product.price)}</td>
                <td>{product.quantity}</td>
                <td>{product._count.orderItems}</td>
                <td>
                  <Select value={product.status} onChange={(e) => setStatus(product, e.target.value)} aria-label={`Status of ${product.name}`} className="h-10 w-36 rounded-full px-3 text-sm font-bold">
                    {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </Select>
                </td>
              </tr>
            ))}
          </TableCard>
        ))}
    </>
  );
}
