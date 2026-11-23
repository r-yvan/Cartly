import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { listProducts } from "@/lib/catalog";

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const products = await listProducts({
      search: searchParams.get("search"),
      category: searchParams.get("category") ?? searchParams.get("categoryId"),
      sort: searchParams.get("sort"),
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return jsonError("Failed to fetch products", 500);
  }
};
