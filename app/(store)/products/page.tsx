import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { listCategories, listProducts } from "@/lib/catalog";
import { CatalogFilters } from "@/components/catalog-filters";
import { ProductCard } from "@/components/product-card";
import { buttonVariants, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop" };

type Search = { search?: string; category?: string; sort?: string };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { search, category, sort } = await searchParams;
  const [products, categories] = await Promise.all([
    listProducts({ search, category, sort }),
    listCategories().then((all) => all.filter((c) => c.count > 0)),
  ]);
  const current = categories.find((c) => c.slug === category);
  const filtered = Boolean(search || category);

  return (
    <div className="container pt-12 lg:pt-16">
      <p className="eyebrow">
        {products.length} {products.length === 1 ? "product" : "products"}
        {search ? ` matching “${search}”` : ""}
      </p>
      <h1 className="display mt-2 text-6xl md:text-8xl">{current?.name ?? "Everything"}</h1>
      {current?.description && <p className="mt-4 max-w-xl text-lg text-muted-foreground">{current.description}</p>}

      <div className="mt-10">
        <CatalogFilters categories={categories} />
      </div>

      {products.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            icon={<SearchX />}
            title={filtered ? "Nothing matches that" : "No products yet"}
            description={
              filtered
                ? "Try a different search term or clear the filters to see everything."
                : "Sellers haven't listed anything yet. Check back soon, or list the first product yourself."
            }
            action={
              <Link href={filtered ? "/products" : "/seller/register"} className={buttonVariants()}>
                {filtered ? "Clear filters" : "Start selling"}
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
