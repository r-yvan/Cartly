import prisma from "@/prisma/client";

/** A buyer's orders with line items and tracking history, newest first. */
export const buyerOrderInclude = {
  items: { include: { product: { include: { images: true } } } },
  tracking: { include: { updates: { orderBy: { timestamp: "desc" as const } } } },
};

export const getBuyerOrder = (id: string, userId: string) =>
  prisma.order.findFirst({ where: { id, userId }, include: buyerOrderInclude });
