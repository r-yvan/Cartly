import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/prisma/client";
import { jsonError, requireUser } from "@/lib/api";
import { ORDER_STATUSES, statusLabel } from "@/lib/utils";

const updateSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
  trackingNumber: z.string().trim().max(80).optional(),
  trackingCompany: z.string().trim().max(80).optional(),
});

const STATUS_NOTES: Record<(typeof ORDER_STATUSES)[number], string> = {
  PENDING: "Order placed. Waiting for the seller to confirm.",
  PROCESSING: "The seller is preparing your order.",
  SHIPPED: "Your order has left the seller.",
  IN_TRANSIT: "Your order is on its way.",
  OUT_FOR_DELIVERY: "Your order is out for delivery today.",
  DELIVERED: "Delivered. Enjoy!",
  CANCELLED: "This order was cancelled.",
};

// GET - Orders that contain this seller's products (only their own line items)
export const GET = async (request: NextRequest) => {
  const { session, error } = await requireUser("SELLER", "ADMIN");
  if (error) return error;
  try {
    const status = z.enum(ORDER_STATUSES).safeParse(new URL(request.url).searchParams.get("status"));
    const mine = { product: { sellerId: session.user.id } };
    const orders = await prisma.order.findMany({
      where: { items: { some: mine }, ...(status.success ? { status: status.data } : {}) },
      include: {
        items: { where: mine, include: { product: { include: { images: true } } } },
        user: { select: { id: true, name: true, email: true } },
        tracking: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (err) {
    console.error("Error fetching seller orders:", err);
    return jsonError("Failed to fetch orders", 500);
  }
};

// PUT - Move an order through fulfilment and record it on the tracking timeline
export const PUT = async (request: NextRequest) => {
  const { session, error } = await requireUser("SELLER", "ADMIN");
  if (error) return error;

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Choose a valid order status", 400);
  const { orderId, status, trackingNumber, trackingCompany } = parsed.data;

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, items: { some: { product: { sellerId: session.user.id } } } },
      include: { tracking: true, items: true },
    });
    if (!order) return jsonError("Order not found", 404);
    if (order.status === "CANCELLED" || order.status === "DELIVERED") {
      return jsonError(`This order is already ${statusLabel(order.status).toLowerCase()}`, 409);
    }

    const delivered = status === "DELIVERED";
    const location = delivered ? order.tracking?.destination ?? {} : order.tracking?.currentLocation ?? {};

    const updated = await prisma.$transaction(async (tx) => {
      if (order.tracking) {
        await tx.orderTracking.update({
          where: { id: order.tracking.id },
          data: {
            status,
            currentLocation: location ?? {},
            updates: { create: { status, location: location ?? {}, description: STATUS_NOTES[status] } },
          },
        });
      }
      if (status === "CANCELLED") {
        // Put the reserved stock back on the shelf.
        for (const item of order.items) {
          await tx.product.updateMany({
            where: { id: item.productId, trackQuantity: true },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }
      return tx.order.update({
        where: { id: orderId },
        data: {
          status,
          trackingNumber: trackingNumber || undefined,
          trackingCompany: trackingCompany || undefined,
          // Orders are paid on delivery, so delivery is when the money lands.
          ...(delivered ? { deliveredAt: new Date(), paymentStatus: "PAID" as const } : {}),
        },
      });
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating order:", err);
    return jsonError("Failed to update order", 500);
  }
};
