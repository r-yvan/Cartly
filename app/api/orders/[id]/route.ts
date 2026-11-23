import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { getBuyerOrder } from "@/lib/orders";

// GET - One of the signed-in buyer's orders, with tracking history
export const GET = async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { session, error } = await requireUser();
  if (error) return error;
  try {
    const order = await getBuyerOrder((await params).id, session.user.id);
    if (!order) return jsonError("Order not found", 404);
    return NextResponse.json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    return jsonError("Failed to fetch order", 500);
  }
};
