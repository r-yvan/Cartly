import type { Prisma } from "@prisma/client";
import prisma from "@/prisma/client";

const SORTS: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  name: { name: "asc" },
};

type ProductQuery = {
  search?: string | null;
  /** Category id or slug. */
  category?: string | null;
  sort?: string | null;
  take?: number;
};

type RawProduct = Prisma.ProductGetPayload<{ include: { images: true; category: true } }>;

/** Converts Decimals to numbers so products can cross into client components. */
export const toPlainProduct = (p: RawProduct) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  description: p.description,
  price: Number(p.price),
  compareAtPrice: p.compareAtPrice === null ? null : Number(p.compareAtPrice),
  quantity: p.quantity,
  trackQuantity: p.trackQuantity,
  status: p.status,
  sellerId: p.sellerId,
  createdAt: p.createdAt.toISOString(),
  category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
  images: p.images.map((i) => ({ id: i.id, url: i.url, altText: i.altText })),
});

export type CatalogProduct = ReturnType<typeof toPlainProduct>;

export async function listProducts({ search, category, sort, take }: ProductQuery = {}) {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  if (category) where.category = { OR: [{ id: category }, { slug: category }] };
  if (search?.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: "insensitive" } },
      { description: { contains: search.trim(), mode: "insensitive" } },
    ];
  }
  const products = await prisma.product.findMany({
    where,
    include: { images: { orderBy: { createdAt: "asc" } }, category: true },
    orderBy: SORTS[sort ?? ""] ?? SORTS.newest,
    take,
  });
  return products.map(toPlainProduct);
}

export async function getProduct(idOrSlug: string) {
  const product = await prisma.product.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], status: { in: ["ACTIVE", "OUT_OF_STOCK"] } },
    include: {
      images: { orderBy: { createdAt: "asc" } },
      category: true,
      seller: { select: { name: true, store: { select: { name: true, slug: true } } } },
    },
  });
  if (!product) return null;
  return {
    ...toPlainProduct(product),
    sellerName: product.seller.store?.name ?? product.seller.name ?? "Cartly seller",
  };
}

export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    count: c._count.products,
  }));
}
