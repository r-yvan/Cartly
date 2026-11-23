import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { jsonError, requireUser } from "@/lib/api";
import { periodStart, seriesByDay } from "@/lib/analytics";

// GET - Fetch seller analytics
export const GET = async (request: NextRequest) => {
  const { session, error } = await requireUser("SELLER", "ADMIN");
  if (error) return error;
  try {
    const sellerId = session.user.id;
    const since = periodStart(request);
    const mine = { product: { sellerId } };

    const [totalProducts, activeProducts, orders, reviews, topProducts, lowStock, store] = await Promise.all([
      prisma.product.count({ where: { sellerId } }),
      prisma.product.count({ where: { sellerId, status: "ACTIVE" } }),
      prisma.order.findMany({
        where: { items: { some: mine }, createdAt: { gte: since }, status: { not: "CANCELLED" } },
        include: { items: { where: mine } },
      }),
      prisma.review.findMany({ where: { product: { sellerId }, createdAt: { gte: since } } }),
      prisma.product.findMany({
        where: { sellerId },
        include: { images: true, _count: { select: { orderItems: true } } },
        orderBy: { orderItems: { _count: "desc" } },
        take: 5,
      }),
      prisma.product.count({ where: { sellerId, trackQuantity: true, quantity: { lte: 5 }, status: "ACTIVE" } }),
      prisma.store.findUnique({ where: { userId: sellerId }, select: { name: true, slug: true } }),
    ]);

    // Only this seller's line items count towards their revenue.
    const sellerTotal = (order: (typeof orders)[number]) =>
      order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    return NextResponse.json({
      store,
      totalProducts,
      activeProducts,
      lowStock,
      totalRevenue: orders.reduce((sum, o) => sum + sellerTotal(o), 0),
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "PENDING").length,
      averageRating: reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0,
      totalReviews: reviews.length,
      topProducts,
      salesByDay: seriesByDay(orders, sellerTotal),
    });
  } catch (err) {
    console.error("Error fetching seller analytics:", err);
    return jsonError("Failed to fetch analytics", 500);
  }
};
