import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/prisma/client";
import { jsonError, requireUser } from "@/lib/api";

// GET - Every product on the platform (admin only)
export const GET = async () => {
  const { error } = await requireUser("ADMIN");
  if (error) return error;
  try {
    const products = await prisma.product.findMany({
      include: {
        images: { take: 1 },
        category: true,
        seller: { select: { name: true, email: true, store: { select: { name: true } } } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    return jsonError("Failed to fetch products", 500);
  }
};

// PUT - Moderate a product by changing its status
export const PUT = async (request: NextRequest) => {
  const { error } = await requireUser("ADMIN");
  if (error) return error;

  const parsed = z
    .object({ id: z.string().min(1), status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED", "OUT_OF_STOCK"]) })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Choose a valid status", 400);

  try {
    const product = await prisma.product.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    return jsonError("Failed to update product", 500);
  }
};
