"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/add-to-cart";
import { useCart } from "@/components/cart-context";
import { SummaryRows } from "@/components/order-summary";
import { buttonVariants, Card, EmptyState, ProductImage } from "@/components/ui";
import { cn, formatPrice, shippingFor } from "@/lib/utils";

export default function CartPage() {
  const { status } = useSession();
  const { items, subtotal, count, loading, setQuantity, remove } = useCart();
  const shipping = shippingFor(subtotal);

  return (
    <div className="container pt-12 lg:pt-16">
      <p className="eyebrow">{count} {count === 1 ? "item" : "items"}</p>
      <h1 className="display mt-2 text-6xl md:text-8xl">Your cart</h1>

      <div className="mt-10">
        {status === "loading" || (status === "authenticated" && loading) ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_24rem]">
            <div className="space-y-4">
              <div className="skeleton h-36" />
              <div className="skeleton h-36" />
            </div>
            <div className="skeleton h-72" />
          </div>
        ) : status === "unauthenticated" ? (
          <EmptyState
            icon={<ShoppingBag />}
            title="Sign in to see your cart"
            description="Your cart is saved to your account, so it follows you across devices."
            action={<Link href="/auth/signin?callbackUrl=/cart" className={buttonVariants()}>Sign in</Link>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag />}
            title="Your cart is empty"
            description="Nothing here yet. Have a look around, there's plenty worth taking home."
            action={<Link href="/products" className={buttonVariants()}>Browse products <ArrowRight /></Link>}
          />
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
            <ul className="divide-y border-y">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-5 md:gap-6">
                  <Link href={`/products/${item.product.slug}`} className="size-24 shrink-0 overflow-hidden rounded-2xl bg-muted md:size-32">
                    <ProductImage src={item.product.images[0]?.url} alt={item.product.name} className="size-full" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link href={`/products/${item.product.slug}`} className="block truncate text-xl font-black tracking-tighter">
                          {item.product.name}
                        </Link>
                        <p className="text-muted-foreground">{formatPrice(item.product.price)} each</p>
                      </div>
                      <p className="text-xl font-black tracking-tighter">{formatPrice(Number(item.product.price) * item.quantity)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <QuantityStepper
                        size="sm"
                        value={item.quantity}
                        max={item.product.trackQuantity ? item.product.quantity : undefined}
                        onChange={(next) => setQuantity(item.id, next)}
                      />
                      <button type="button" onClick={() => remove(item.id)} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="size-4" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Card className="p-6 lg:sticky lg:top-24">
              <h2 className="text-2xl font-black">Summary</h2>
              <div className="mt-5">
                <SummaryRows subtotal={subtotal} shipping={shipping} total={subtotal + shipping} />
              </div>
              <Link href="/checkout" className={cn(buttonVariants({ size: "lg", variant: "brand" }), "mt-6 w-full")}>
                Checkout <ArrowRight />
              </Link>
              <p className="mt-3 text-center text-sm text-muted-foreground">You pay when your order is delivered.</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
