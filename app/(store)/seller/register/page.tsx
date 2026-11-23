"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, BarChart3, Package, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants, Card, Field, Input, Textarea } from "@/components/ui";
import { api } from "@/lib/fetcher";

const STEPS = [
  { icon: Package, title: "List your products", body: "Add photos, a price and your stock. They go live immediately." },
  { icon: Truck, title: "Ship and update", body: "Move each order through fulfilment so buyers always know where it is." },
  { icon: BarChart3, title: "Watch it grow", body: "See revenue, best sellers and low stock on one dashboard." },
];

export default function SellerRegister() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [saving, setSaving] = React.useState(false);
  const role = session?.user?.role;

  // Existing sellers have nothing to do here.
  React.useEffect(() => {
    if (role === "SELLER") router.replace("/seller/dashboard");
  }, [role, router]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api("/api/seller/register", { method: "POST", body: Object.fromEntries(new FormData(event.currentTarget)) });
      await update(); // refresh the session so it carries the new seller role
      toast.success("Your store is open");
      router.push("/seller/products?new=1");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
      setSaving(false);
    }
  };

  return (
    <div className="container grid gap-12 pt-12 lg:grid-cols-2 lg:gap-20 lg:pt-20">
      <div>
        <p className="eyebrow">Sell on Cartly</p>
        <h1 className="display mt-2 text-6xl md:text-8xl">Open your store.</h1>
        <p className="mt-5 max-w-md text-lg text-muted-foreground">
          No listing fees and no setup maze. Name your store, add a product, and you&apos;re selling.
        </p>
        <ol className="mt-10 space-y-6">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted"><Icon className="size-5" /></span>
              <div>
                <h2 className="text-xl font-black"><span className="text-muted-foreground">{i + 1}.</span> {title}</h2>
                <p className="text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <Card className="self-start p-6 md:p-8">
        {status === "loading" ? (
          <div className="skeleton h-80" />
        ) : status === "unauthenticated" ? (
          <div className="py-8 text-center">
            <h2 className="text-3xl font-black">First, an account</h2>
            <p className="mt-2 text-muted-foreground">You need a Cartly account before you can open a store.</p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/auth/register?callbackUrl=/seller/register" className={buttonVariants({ size: "lg", variant: "brand" })}>Create an account <ArrowRight /></Link>
              <Link href="/auth/signin?callbackUrl=/seller/register" className={buttonVariants({ size: "lg", variant: "outline" })}>I already have one</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <h2 className="text-3xl font-black">About your store</h2>
            <Field label="Store name"><Input name="name" required minLength={2} maxLength={60} placeholder="Northside Goods" /></Field>
            <Field label="What do you sell?" hint="Optional. A sentence or two shown to buyers.">
              <Textarea name="description" maxLength={500} placeholder="Small-batch homeware made in our workshop." />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone (optional)"><Input name="phone" type="tel" maxLength={30} /></Field>
              <Field label="City / address (optional)"><Input name="address" maxLength={200} /></Field>
            </div>
            <Button type="submit" size="lg" variant="brand" className="w-full" loading={saving}>Open my store</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
