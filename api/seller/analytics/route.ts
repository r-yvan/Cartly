import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/prisma/client";

// GET - Fetch seller analytics
export const GET = async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Get total products
    const totalProducts = await prisma.product.count({
      where: { sellerId: session.user.id },
    });

    // Get active products
    const activeProducts = await prisma.product.count({
      where: {
        sellerId: session.user.id,
        status: "ACTIVE",
      },
    });

    // Get orders containing seller's products
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              sellerId: session.user.id,
            },
          },
        },
        createdAt: {
          gte: daysAgo,
        },
      },
      include: {
        items: {
          where: {
            product: {
              sellerId: session.user.id,
            },
          },
        },
      },
    });

    // Calculate revenue
    const totalRevenue = orders.reduce((sum, order) => {
      const sellerItemsTotal = order.items.reduce(
        (itemSum, item) => itemSum + Number(item.price) * item.quantity,
        0
      );
      return sum + sellerItemsTotal;
    }, 0);

    // Get total orders
    const totalOrders = orders.length;

    // Get pending orders
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: {
        product: {
          sellerId: session.user.id,
        },
        createdAt: {
          gte: daysAgo,
        },
      },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Get top products
    const topProducts = await prisma.product.findMany({
      where: {
        sellerId: session.user.id,
      },
      include: {
        images: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: {
        orderItems: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // Sales over time (last 7 days)
    const salesByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = orders.filter(
        (o) => o.createdAt >= date && o.createdAt < nextDate
      );

      const dayRevenue = dayOrders.reduce((sum, order) => {
        const sellerItemsTotal = order.items.reduce(
          (itemSum, item) => itemSum + Number(item.price) * item.quantity,
          0
        );
        return sum + sellerItemsTotal;
      }, 0);

      salesByDay.push({
        date: date.toISOString().split("T")[0],
        revenue: dayRevenue,
        orders: dayOrders.length,
      });
    }

    return NextResponse.json({
      totalProducts,
      activeProducts,
      totalRevenue,
      totalOrders,
      pendingOrders,
      averageRating,
      totalReviews: reviews.length,
      topProducts,
      salesByDay,
    });
  } catch (error) {
    console.error("Error fetching seller analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
};
