import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { jsonError, requireUser } from "@/lib/api";
import { buyerOrderInclude } from "@/lib/orders";

// GET - Fetch the signed-in buyer's orders
export const GET = async () => {
  const { session, error } = await requireUser();
  if (error) return error;
  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: buyerOrderInclude,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (err) {
    console.error("Error fetching buyer orders:", err);
    return jsonError("Failed to fetch orders", 500);
  }
};
