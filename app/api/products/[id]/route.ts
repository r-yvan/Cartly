import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { getProduct } from "@/lib/catalog";

export const GET = async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const product = await getProduct((await params).id);
    if (!product) return jsonError("Product not found", 404);
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return jsonError("Failed to fetch product", 500);
  }
};
