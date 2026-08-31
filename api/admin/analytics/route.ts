import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/prisma/client";

// GET - Fetch platform analytics (admin only)
export const GET = async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30";

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Total users
    const totalUsers = await prisma.user.count();
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: daysAgo } },
    });

    // Total products
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({
      where: { status: "ACTIVE" },
    });

    // Total orders
    const totalOrders = await prisma.order.count();
    const recentOrders = await prisma.order.count({
      where: { createdAt: { gte: daysAgo } },
    });

    // Revenue
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: daysAgo },
      },
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0
    );

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
      where: {
        createdAt: { gte: daysAgo },
      },
    });

    // Revenue over time
    const revenueByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = orders.filter(
        (o) => o.createdAt >= date && o.createdAt < nextDate
      );

      const dayRevenue = dayOrders.reduce(
        (sum, order) => sum + Number(order.total),
        0
      );

      revenueByDay.push({
        date: date.toISOString().split("T")[0],
        revenue: dayRevenue,
        orders: dayOrders.length,
      });
    }

    return NextResponse.json({
      totalUsers,
      newUsers,
      totalProducts,
      activeProducts,
      totalOrders,
      recentOrders,
      totalRevenue,
      ordersByStatus,
      revenueByDay,
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
};
