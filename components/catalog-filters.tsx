"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string; count: number };

export function CatalogFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = React.useTransition();
  const [search, setSearch] = React.useState(params.get("search") ?? "");
  const active = params.get("category");

  const update = React.useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      startTransition(() => router.replace(`${pathname}?${next}`, { scroll: false }));
    },
    [params, pathname, router]
  );

  // Debounce typing so the catalog isn't re-queried on every keystroke.
  React.useEffect(() => {
    if (search === (params.get("search") ?? "")) return;
    const timer = setTimeout(() => update("search", search.trim() || null), 350);
    return () => clearTimeout(timer);
  }, [search, params, update]);

  const chip = (selected: boolean) =>
    cn(
      "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition-colors",
      selected ? "border-foreground bg-foreground text-background" : "hover:border-foreground/40"
    );

  return (
    <div className={cn("flex flex-col gap-4 transition-opacity", pending && "opacity-60")}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="h-12 rounded-full pl-11 pr-11 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full hover:bg-accent">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="relative sm:w-56">
          <Select value={params.get("sort") ?? "newest"} onChange={(e) => update("sort", e.target.value === "newest" ? null : e.target.value)} aria-label="Sort products" className="rounded-full">
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </Select>
        </div>
      </div>
      {categories.length > 0 && (
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
          <button type="button" onClick={() => update("category", null)} className={chip(!active)}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.id} type="button" onClick={() => update("category", c.slug)} className={chip(active === c.slug)}>
              {c.name} <span className="ml-1 opacity-50">{c.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
