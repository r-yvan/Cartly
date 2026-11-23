"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";
import { useCart } from "@/components/cart-context";
import { Badge, ProductImage } from "@/components/ui";
import { cn, formatPrice } from "@/lib/utils";
import { discountOf, isSoldOut } from "@/lib/product-helpers";

export function ProductCard({ product, priority }: { product: CatalogProduct; priority?: boolean }) {
  const { add } = useCart();
  const [adding, setAdding] = React.useState(false);
  const soldOut = isSoldOut(product);
  const discount = discountOf(product);

  const quickAdd = async () => {
    setAdding(true);
    await add(product.id);
    setAdding(false);
  };

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
        <Link href={`/products/${product.slug}`} aria-label={product.name} className="block size-full">
          <ProductImage
            src={product.images[0]?.url}
            alt={product.name}
            priority={priority}
            className={cn(
              "size-full transition-transform duration-700 ease-out group-hover:scale-[1.06]",
              soldOut && "opacity-50 grayscale"
            )}
          />
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex gap-1.5">
          {soldOut ? <Badge className="bg-background text-foreground">Sold out</Badge> : discount > 0 && <Badge tone="brand">−{discount}%</Badge>}
        </div>
        {!soldOut && (
          <button
            type="button"
            onClick={quickAdd}
            disabled={adding}
            aria-label={`Add ${product.name} to cart`}
            className="absolute bottom-3 right-3 flex h-11 items-center gap-1.5 rounded-full bg-background px-4 text-sm font-bold text-foreground shadow-soft transition-all duration-300 hover:bg-brand hover:text-brand-foreground focus-visible:translate-y-0 focus-visible:opacity-100 disabled:opacity-60 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          >
            <Plus className={cn("size-4", adding && "animate-spin")} />
            Add
          </button>
        )}
      </div>
      <div className="mt-3.5 flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <h3 className="truncate text-[17px] font-bold tracking-tight">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="text-sm text-muted-foreground">{product.category?.name ?? "Essentials"}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[17px] font-black tracking-tight">{formatPrice(product.price)}</p>
          {discount > 0 && <p className="text-sm text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</p>}
        </div>
      </div>
    </article>
  );
}
