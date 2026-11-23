import Link from "next/link";
import { ArrowRight, ArrowUpRight, PackageCheck, ShieldCheck, Store, Truck } from "lucide-react";
import prisma from "@/prisma/client";
import { listCategories, listProducts, type CatalogProduct } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { buttonVariants, ProductImage } from "@/components/ui";
import { cn, formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";

// Reads live inventory, so it is rendered per request rather than at build time.
export const dynamic = "force-dynamic";

async function loadHome() {
  try {
    const [products, categories, sellers, productCount] = await Promise.all([
      listProducts({ take: 8 }),
      listCategories(),
      prisma.user.count({ where: { role: "SELLER" } }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
    ]);
    return { products, categories: categories.filter((c) => c.count > 0), sellers, productCount };
  } catch (error) {
    // The storefront still renders (with empty shelves) if the database is unreachable.
    console.error("Home page could not load catalog:", error);
    return { products: [], categories: [], sellers: 0, productCount: 0 };
  }
}

const TICKER = [
  `Free shipping over $${FREE_SHIPPING_THRESHOLD}`,
  "Pay when it arrives",
  "Independent sellers",
  "Every order tracked",
  "New drops weekly",
];

const PROMISES = [
  { icon: Truck, title: "Tracked to your door", body: "Every order gets a live timeline, from the seller's shelf to your doorstep." },
  { icon: ShieldCheck, title: "Pay on delivery", body: "Nothing leaves your account until the parcel is actually in your hands." },
  { icon: PackageCheck, title: "Sold by real people", body: "Each product comes from an independent store that stands behind what it sells." },
];

function HeroTile({ product, className, priority }: { product: CatalogProduct; className?: string; priority?: boolean }) {
  return (
    <Link href={`/products/${product.slug}`} className={cn("group relative block overflow-hidden rounded-4xl bg-muted", className)}>
      <ProductImage src={product.images[0]?.url} alt={product.name} priority={priority} className="absolute inset-0 size-full transition-transform duration-1000 ease-out group-hover:scale-105" />
      <span className="glass absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <span className="min-w-0">
          <span className="block truncate font-bold tracking-tight">{product.name}</span>
          <span className="block text-sm text-muted-foreground">{formatPrice(product.price)}</span>
        </span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:rotate-45">
          <ArrowUpRight className="size-4" />
        </span>
      </span>
    </Link>
  );
}

export default async function Home() {
  const { products, categories, sellers, productCount } = await loadHome();
  const [first, second, third] = products;
  const stats = [
    { value: productCount, label: productCount === 1 ? "product in stock" : "products in stock" },
    { value: sellers, label: sellers === 1 ? "independent seller" : "independent sellers" },
    { value: categories.length, label: categories.length === 1 ? "category" : "categories" },
  ].filter((s) => s.value > 0);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="dot-grid absolute inset-0 -z-10" />
        <div aria-hidden className="absolute -right-40 -top-40 -z-10 size-[36rem] rounded-full bg-brand/25 blur-[120px] dark:bg-brand/10" />
        <div className="container grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border bg-card py-1.5 pl-2 pr-4 text-sm font-bold">
              <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-black text-brand-foreground">New</span>
              Fresh drops from independent sellers
            </p>
            <h1 className="display mt-6 text-[clamp(3.6rem,10.5vw,9rem)] leading-[0.98]">
              Good things,
              <br />
              <span className="relative isolate inline-block">
                <span aria-hidden className="absolute inset-x-[-0.06em] bottom-[0.1em] top-[0.2em] -z-10 -rotate-1 rounded-[0.18em] bg-brand" />
                <span className="dark:text-brand-foreground">well made.</span>
              </span>
            </h1>
            <p className="mt-7 max-w-md text-lg text-muted-foreground md:text-xl">
              Cartly is a marketplace for everyday objects worth keeping. Buy directly from the people who make and source them.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/products" className={buttonVariants({ size: "lg" })}>
                Shop the collection <ArrowRight />
              </Link>
              <Link href="/seller/register" className={buttonVariants({ size: "lg", variant: "outline" })}>
                Start selling
              </Link>
            </div>
            {stats.length > 0 && (
              <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t pt-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dd className="text-4xl font-black tracking-tightest">{stat.value}</dd>
                    <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {first ? (
            <div className="grid h-[30rem] animate-fade-up grid-cols-2 grid-rows-2 gap-3 [animation-delay:120ms] sm:h-[36rem] lg:h-[40rem]">
              <HeroTile product={first} priority className={cn("row-span-2", !second && "col-span-2")} />
              {second && <HeroTile product={second} priority className={cn(!third && "row-span-2")} />}
              {third && <HeroTile product={third} priority />}
            </div>
          ) : (
            <div className="flex h-[26rem] animate-fade-up flex-col justify-between rounded-4xl bg-brand p-8 text-brand-foreground [animation-delay:120ms] lg:h-[34rem]">
              <Store className="size-10" />
              <div>
                <p className="display text-5xl">The shelves are being stocked.</p>
                <p className="mt-3 max-w-xs font-medium opacity-80">Be the first store on Cartly and put your products in front of every visitor.</p>
                <Link href="/seller/register" className={cn(buttonVariants(), "mt-6 bg-brand-foreground text-brand hover:bg-brand-foreground/85")}>
                  Open your store <ArrowRight />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Ticker */}
      <div className="overflow-hidden border-y bg-foreground py-4 text-background" aria-hidden>
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {[...TICKER, ...TICKER].map((text, i) => (
                <span key={i} className="flex items-center text-xl font-black tracking-tighter">
                  <span className="px-7">{text}</span>
                  <span className="size-2 rounded-full bg-brand" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* New arrivals */}
      {products.length > 0 && (
        <section className="container pt-20 lg:pt-28">
          <Reveal className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Just landed</p>
              <h2 className="display mt-2 text-5xl md:text-7xl">New arrivals</h2>
            </div>
            <Link href="/products" className={cn(buttonVariants({ variant: "outline" }), "hidden sm:inline-flex")}>
              View all <ArrowRight />
            </Link>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 0.06}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
          <Link href="/products" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-10 w-full sm:hidden")}>
            View all products
          </Link>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container pt-20 lg:pt-28">
          <Reveal>
            <p className="eyebrow">Browse</p>
            <h2 className="display mt-2 text-5xl md:text-7xl">Shop by category</h2>
          </Reveal>
          <Reveal className="mt-10 border-t">
            {categories.map((category, i) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group flex items-center gap-5 border-b py-6 transition-[padding] duration-300 hover:px-4 md:py-8"
              >
                <span className="w-8 text-sm font-bold tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-3xl font-black tracking-tighter transition-colors md:text-5xl">{category.name}</span>
                <span className="ml-auto hidden text-muted-foreground sm:block">
                  {category.count} {category.count === 1 ? "product" : "products"}
                </span>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border transition-all duration-300 group-hover:rotate-45 group-hover:border-brand group-hover:bg-brand group-hover:text-brand-foreground">
                  <ArrowUpRight className="size-5" />
                </span>
              </Link>
            ))}
          </Reveal>
        </section>
      )}

      {/* Promises */}
      <section className="container grid gap-4 pt-20 md:grid-cols-3 lg:pt-28">
        {PROMISES.map(({ icon: Icon, title, body }, i) => (
          <Reveal key={title} delay={i * 0.08} className="rounded-4xl border bg-card p-8">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-10 text-2xl font-black">{title}</h3>
            <p className="mt-2 text-muted-foreground">{body}</p>
          </Reveal>
        ))}
      </section>

      {/* Seller call to action */}
      <section className="container pt-20 lg:pt-28">
        <Reveal className="relative overflow-hidden rounded-4xl bg-brand px-7 py-14 text-brand-foreground md:px-14 md:py-20">
          <p className="text-xs font-bold uppercase tracking-wide opacity-70">For makers and merchants</p>
          <h2 className="display mt-3 max-w-3xl text-5xl md:text-8xl">Your store, open in two minutes.</h2>
          <p className="mt-5 max-w-lg text-lg font-medium opacity-80">
            List products, follow orders through delivery and watch your revenue, all from one calm dashboard.
          </p>
          <Link href="/seller/register" className={cn(buttonVariants({ size: "lg" }), "mt-9 bg-brand-foreground text-brand hover:bg-brand-foreground/85")}>
            Open your store <ArrowRight />
          </Link>
          <Store aria-hidden className="absolute -bottom-10 -right-6 size-64 -rotate-12 opacity-10 md:size-96" strokeWidth={1.2} />
        </Reveal>
      </section>
    </>
  );
}
