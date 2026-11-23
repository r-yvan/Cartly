import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { jsonError, requireUser } from "@/lib/api";

// GET - Every order on the platform (admin only)
export const GET = async () => {
  const { error } = await requireUser("ADMIN");
  if (error) return error;
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    return jsonError("Failed to fetch orders", 500);
  }
};
