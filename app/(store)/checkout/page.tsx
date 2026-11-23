"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, Banknote, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-context";
import { SummaryRows } from "@/components/order-summary";
import { Button, buttonVariants, Card, EmptyState, Field, Input, ProductImage, Textarea } from "@/components/ui";
import { api } from "@/lib/fetcher";
import { formatPrice, shippingFor } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, loading, refresh } = useCart();
  const [submitting, setSubmitting] = React.useState(false);
  const [placed, setPlaced] = React.useState(false);
  const shipping = shippingFor(subtotal);
  const [firstName = "", ...rest] = (session?.user?.name ?? "").split(" ");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { customerNote, ...shippingAddress } = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    setSubmitting(true);
    try {
      const order = await api<{ id: string }>("/api/orders", { method: "POST", body: { shippingAddress, customerNote } });
      setPlaced(true);
      router.push(`/orders/${order.id}?placed=1`);
      refresh();
    } catch (err) {
      toast.error((err as Error).message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container grid gap-8 pt-16 lg:grid-cols-[1fr_26rem]">
        <div className="skeleton h-[32rem]" />
        <div className="skeleton h-80" />
      </div>
    );
  }

  // `placed` keeps the form on screen while we navigate to the confirmation page.
  if (items.length === 0 && !placed) {
    return (
      <div className="container pt-16">
        <EmptyState
          icon={<ShoppingBag />}
          title="Nothing to check out"
          description="Add something to your cart first, then come back here."
          action={<Link href="/products" className={buttonVariants()}>Browse products <ArrowRight /></Link>}
        />
      </div>
    );
  }

  return (
    <div className="container pt-12 lg:pt-16">
      <p className="eyebrow">Last step</p>
      <h1 className="display mt-2 text-6xl md:text-8xl">Checkout</h1>

      <form onSubmit={submit} className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_26rem]">
        <div className="space-y-6">
          <Card className="p-6 md:p-8">
            <h2 className="text-2xl font-black">Where should we send it?</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="First name"><Input name="firstName" required defaultValue={firstName} autoComplete="given-name" /></Field>
              <Field label="Last name"><Input name="lastName" required defaultValue={rest.join(" ")} autoComplete="family-name" /></Field>
              <Field label="Street address" className="sm:col-span-2"><Input name="address1" required minLength={3} autoComplete="address-line1" /></Field>
              <Field label="Apartment, suite (optional)" className="sm:col-span-2"><Input name="address2" autoComplete="address-line2" /></Field>
              <Field label="City"><Input name="city" required autoComplete="address-level2" /></Field>
              <Field label="State / province (optional)"><Input name="state" autoComplete="address-level1" /></Field>
              <Field label="Postal code (optional)"><Input name="postalCode" autoComplete="postal-code" /></Field>
              <Field label="Country"><Input name="country" required minLength={2} autoComplete="country-name" /></Field>
              <Field label="Phone" hint="The courier will call this number on delivery day." className="sm:col-span-2">
                <Input name="phone" type="tel" required minLength={6} autoComplete="tel" />
              </Field>
              <Field label="Note for the seller (optional)" className="sm:col-span-2">
                <Textarea name="customerNote" maxLength={500} placeholder="Gate code, preferred delivery time…" />
              </Field>
            </div>
          </Card>

          <Card className="flex items-start gap-4 p-6 md:p-8">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
              <Banknote className="size-5" />
            </span>
            <div>
              <h2 className="text-2xl font-black">Pay on delivery</h2>
              <p className="mt-1 text-muted-foreground">
                Nothing is charged now. You pay the courier {formatPrice(subtotal + shipping)} when your order arrives.
              </p>
            </div>
          </Card>
        </div>

        <Card className="p-6 lg:sticky lg:top-24">
          <h2 className="text-2xl font-black">Your order</h2>
          <ul className="mt-5 space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <div className="relative size-16 shrink-0">
                  <ProductImage src={item.product.images[0]?.url} alt="" className="size-full rounded-xl" />
                  <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[11px] font-black text-background">
                    {item.quantity}
                  </span>
                </div>
                <p className="min-w-0 flex-1 truncate font-bold">{item.product.name}</p>
                <p className="font-bold">{formatPrice(Number(item.product.price) * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t pt-5">
            <SummaryRows subtotal={subtotal} shipping={shipping} total={subtotal + shipping} />
          </div>
          <Button type="submit" size="lg" variant="brand" className="mt-6 w-full" loading={submitting}>
            Place order
          </Button>
        </Card>
      </form>
    </div>
  );
}
