import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return jsonError("Failed to fetch categories", 500);
  }
};
