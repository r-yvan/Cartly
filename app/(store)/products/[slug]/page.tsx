import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { getProduct, listProducts } from "@/lib/catalog";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { discountOf, isSoldOut } from "@/lib/product-helpers";
import { ProductGallery } from "@/components/product-gallery";
import { Badge } from "@/components/ui";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug).catch(() => null);
  return product ? { title: product.name, description: product.description.slice(0, 160) } : { title: "Product not found" };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const soldOut = isSoldOut(product);
  const discount = discountOf(product);
  const lowStock = !soldOut && product.trackQuantity && product.quantity <= 5;
  const related = product.category
    ? (await listProducts({ category: product.category.id, take: 5 })).filter((p) => p.id !== product.id).slice(0, 4)
    : [];

  return (
    <div className="container pt-8 lg:pt-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-foreground">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="size-3.5" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">{product.category.name}</Link>
          </>
        )}
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow">Sold by {product.sellerName}</p>
          <h1 className="display mt-3 text-5xl md:text-6xl">{product.name}</h1>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="text-4xl font-black tracking-tightest">{formatPrice(product.price)}</p>
            {discount > 0 && (
              <>
                <p className="text-xl text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</p>
                <Badge tone="brand">Save {discount}%</Badge>
              </>
            )}
          </div>

          <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8">
            <AddToCart productId={product.id} soldOut={soldOut} max={product.trackQuantity ? product.quantity : undefined} />
            {lowStock && <p className="mt-3 text-sm font-bold text-warning">Only {product.quantity} left in stock</p>}
          </div>

          <ul className="mt-8 divide-y rounded-3xl border bg-card">
            {[
              { icon: Truck, text: `Free shipping on orders over $${FREE_SHIPPING_THRESHOLD}` },
              { icon: ShieldCheck, text: "Pay on delivery, nothing charged up front" },
              { icon: RotateCcw, text: "Tracked from the seller to your door" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 px-5 py-4 font-medium">
                <Icon className="size-[18px] text-muted-foreground" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pt-20 lg:pt-28">
          <h2 className="display text-4xl md:text-6xl">You might also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
