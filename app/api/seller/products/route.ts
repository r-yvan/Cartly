import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/prisma/client";
import { jsonError, requireUser, slugify } from "@/lib/api";

const productSchema = z.object({
  name: z.string().trim().min(2, "Give the product a name").max(120),
  description: z.string().trim().min(10, "Describe the product in at least 10 characters"),
  price: z.coerce.number().positive("Price must be greater than zero").max(99999999),
  compareAtPrice: z.coerce.number().positive().max(99999999).nullish(),
  quantity: z.coerce.number().int().min(0).default(0),
  sku: z.string().trim().max(60).nullish(),
  categoryId: z.string().trim().min(1).nullish(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED", "OUT_OF_STOCK"]).default("ACTIVE"),
  images: z.array(z.string().trim().url("Image links must be full URLs")).max(6).default([]),
});

const include = {
  images: { orderBy: { createdAt: "asc" as const } },
  category: true,
  _count: { select: { reviews: true, orderItems: true } },
};

// GET - Fetch the seller's products
export const GET = async (request: NextRequest) => {
  const { session, error } = await requireUser("SELLER", "ADMIN");
  if (error) return error;
  try {
    const status = new URL(request.url).searchParams.get("status");
    const parsedStatus = productSchema.shape.status.safeParse(status);
    const products = await prisma.product.findMany({
      where: { sellerId: session.user.id, ...(parsedStatus.success && status ? { status: parsedStatus.data } : {}) },
      include,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (err) {
    console.error("Error fetching seller products:", err);
    return jsonError("Failed to fetch products", 500);
  }
};

// POST - Create a product
export const POST = async (request: NextRequest) => {
  const { session, error } = await requireUser("SELLER", "ADMIN");
  if (error) return error;

  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.errors[0].message, 400);
  const { images, ...data } = parsed.data;

  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        slug: `${slugify(data.name) || "product"}-${Date.now().toString(36)}`,
        sellerId: session.user.id,
        images: { create: images.map((url) => ({ url, altText: data.name })) },
      },
      include,
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("Error creating product:", err);
    return jsonError("Failed to create product", 500);
  }
};

// PUT - Update a product the seller owns
export const PUT = async (request: NextRequest) => {
  const { session, error } = await requireUser("SELLER", "ADMIN");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : null;
  // Only whitelisted fields are applied, so ownership and slugs can't be rewritten.
  const parsed = productSchema.partial().safeParse(body);
  if (!id) return jsonError("Product ID is required", 400);
  if (!parsed.success) return jsonError(parsed.error.errors[0].message, 400);
  const { images, ...data } = parsed.data;

  try {
    const existing = await prisma.product.findFirst({ where: { id, sellerId: session.user.id } });
    if (!existing) return jsonError("Product not found", 404);

    const product = await prisma.$transaction(async (tx) => {
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: images.map((url) => ({ url, productId: id, altText: data.name ?? existing.name })),
        });
      }
      return tx.product.update({ where: { id }, data, include });
    });
    return NextResponse.json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    return jsonError("Failed to update product", 500);
  }
};

// DELETE - Remove a product. Products that appear in past orders are archived
// instead, so order history keeps pointing at something real.
export const DELETE = async (request: NextRequest) => {
  const { session, error } = await requireUser("SELLER", "ADMIN");
  if (error) return error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("Product ID is required", 400);

  try {
    const existing = await prisma.product.findFirst({
      where: { id, sellerId: session.user.id },
      include: { _count: { select: { orderItems: true } } },
    });
    if (!existing) return jsonError("Product not found", 404);

    if (existing._count.orderItems > 0) {
      await prisma.$transaction([
        prisma.cartItem.deleteMany({ where: { productId: id } }),
        prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } }),
      ]);
      return NextResponse.json({ archived: true, message: "Product archived because it has past orders" });
    }

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      prisma.wishlistItem.deleteMany({ where: { productId: id } }),
      prisma.review.deleteMany({ where: { productId: id } }),
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.productOptionValue.deleteMany({ where: { option: { productId: id } } }),
      prisma.productOption.deleteMany({ where: { productId: id } }),
      prisma.productVariant.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);
    return NextResponse.json({ archived: false, message: "Product deleted" });
  } catch (err) {
    console.error("Error deleting product:", err);
    return jsonError("Failed to delete product", 500);
  }
};
