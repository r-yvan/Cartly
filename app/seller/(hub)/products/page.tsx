"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LoadState, PageHeader, TableCard } from "@/components/dashboard";
import { ProductForm, type SellerProduct } from "@/components/product-form";
import { Button, EmptyState, ProductImage, StatusBadge } from "@/components/ui";
import { api } from "@/lib/fetcher";
import { useApi } from "@/lib/use-api";
import { formatPrice } from "@/lib/utils";

function SellerProducts() {
  const { data: products, loading, error, reload } = useApi<SellerProduct[]>("/api/seller/products");
  // `undefined` = form closed, `null` = creating, a product = editing it.
  const [editing, setEditing] = React.useState<SellerProduct | null | undefined>(
    useSearchParams().get("new") ? null : undefined
  );
  const close = React.useCallback(() => setEditing(undefined), []);

  const remove = async (product: SellerProduct) => {
    if (!window.confirm(`Delete “${product.name}”? This can't be undone.`)) return;
    try {
      const { message } = await api<{ message: string }>(`/api/seller/products?id=${product.id}`, { method: "DELETE" });
      toast.success(message);
      reload();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const addButton = <Button variant="brand" onClick={() => setEditing(null)}><Plus /> Add product</Button>;

  return (
    <>
      <PageHeader eyebrow="Seller hub" title="Products" action={addButton} />
      <LoadState loading={loading} error={error} onRetry={reload} />
      {products &&
        (products.length === 0 ? (
          <EmptyState icon={<Package />} title="No products yet" description="List your first product and it will appear in the shop straight away." action={addButton} />
        ) : (
          <TableCard head={["Product", "Status", "Price", "Stock", "Sold", ""]}>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <ProductImage src={product.images[0]?.url} alt="" className="size-12 shrink-0 rounded-xl" />
                    <div className="min-w-0">
                      <p className="max-w-56 truncate font-bold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category?.name ?? "No category"}</p>
                    </div>
                  </div>
                </td>
                <td><StatusBadge status={product.status} /></td>
                <td className="font-bold">{formatPrice(product.price)}</td>
                <td className={product.quantity <= 5 ? "font-bold text-warning" : ""}>{product.quantity}</td>
                <td>{product._count.orderItems}</td>
                <td>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${product.name}`} onClick={() => setEditing(product)}><Pencil /></Button>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${product.name}`} className="hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(product)}><Trash2 /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </TableCard>
        ))}
      {editing !== undefined && (
        <ProductForm
          product={editing}
          onClose={close}
          onSaved={() => {
            close();
            reload();
          }}
        />
      )}
    </>
  );
}

export default function Page() {
  // useSearchParams needs a Suspense boundary to keep the page statically renderable.
  return (
    <Suspense>
      <SellerProducts />
    </Suspense>
  );
}
