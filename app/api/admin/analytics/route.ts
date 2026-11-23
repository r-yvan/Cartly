import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { jsonError, requireUser } from "@/lib/api";
import { periodStart, seriesByDay } from "@/lib/analytics";

// GET - Fetch platform analytics (admin only)
export const GET = async (request: NextRequest) => {
  const { error } = await requireUser("ADMIN");
  if (error) return error;
  try {
    const since = periodStart(request);
    const [totalUsers, newUsers, totalSellers, totalProducts, activeProducts, totalOrders, orders, ordersByStatus] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: since } } }),
        prisma.user.count({ where: { role: "SELLER" } }),
        prisma.product.count(),
        prisma.product.count({ where: { status: "ACTIVE" } }),
        prisma.order.count(),
        prisma.order.findMany({
          where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
          select: { total: true, createdAt: true, paymentStatus: true },
        }),
        prisma.order.groupBy({ by: ["status"], _count: true, where: { createdAt: { gte: since } } }),
      ]);

    const total = (o: (typeof orders)[number]) => Number(o.total);
    return NextResponse.json({
      totalUsers,
      newUsers,
      totalSellers,
      totalProducts,
      activeProducts,
      totalOrders,
      recentOrders: orders.length,
      // Booked = every live order; collected = orders already paid for.
      totalRevenue: orders.reduce((sum, o) => sum + total(o), 0),
      collectedRevenue: orders.filter((o) => o.paymentStatus === "PAID").reduce((sum, o) => sum + total(o), 0),
      ordersByStatus,
      revenueByDay: seriesByDay(orders, total),
    });
  } catch (err) {
    console.error("Error fetching admin analytics:", err);
    return jsonError("Failed to fetch analytics", 500);
  }
};
