import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { jsonError, requireUser } from "@/lib/api";

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
    include: { product: { include: { images: true } }, variant: true },
  },
};

const loadCart = (userId: string) =>
  prisma.cart.upsert({ where: { userId }, update: {}, create: { userId }, include: cartInclude });

/** Finds a cart line only if it belongs to the given user. */
const findOwnItem = (itemId: string, userId: string) =>
  prisma.cartItem.findFirst({ where: { id: itemId, cart: { userId } }, include: { product: true } });

export const GET = async () => {
  const { session, error } = await requireUser();
  if (error) return error;
  try {
    return NextResponse.json(await loadCart(session.user.id));
  } catch (err) {
    console.error("Error fetching cart:", err);
    return jsonError("Failed to fetch cart", 500);
  }
};

export const POST = async (request: NextRequest) => {
  const { session, error } = await requireUser();
  if (error) return error;
  try {
    const { productId, variantId = null, quantity = 1, selectedOptions } = await request.json();
    const qty = Math.floor(Number(quantity));
    if (!productId || !Number.isFinite(qty) || qty < 1) {
      return jsonError("A product and a positive quantity are required", 400);
    }

    const product = await prisma.product.findFirst({ where: { id: productId, status: "ACTIVE" } });
    if (!product) return jsonError("This product is no longer available", 404);

    const cart = await loadCart(session.user.id);
    // findFirst rather than the compound unique key: Prisma can't match a null variantId there.
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId },
    });

    const nextQuantity = (existing?.quantity ?? 0) + qty;
    if (product.trackQuantity && nextQuantity > product.quantity) {
      return jsonError(
        product.quantity === 0 ? "This product is sold out" : `Only ${product.quantity} left in stock`,
        409
      );
    }

    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQuantity } });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, variantId, quantity: qty, selectedOptions },
      });
    }
    return NextResponse.json(await loadCart(session.user.id), { status: existing ? 200 : 201 });
  } catch (err) {
    console.error("Error adding to cart:", err);
    return jsonError("Failed to add item to cart", 500);
  }
};

export const PUT = async (request: NextRequest) => {
  const { session, error } = await requireUser();
  if (error) return error;
  try {
    const { itemId, quantity } = await request.json();
    const qty = Math.floor(Number(quantity));
    if (!itemId || !Number.isFinite(qty)) return jsonError("Item ID and quantity are required", 400);

    const item = await findOwnItem(itemId, session.user.id);
    if (!item) return jsonError("Item not found in cart", 404);

    if (qty <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      if (item.product.trackQuantity && qty > item.product.quantity) {
        return jsonError(`Only ${item.product.quantity} left in stock`, 409);
      }
      await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: qty } });
    }
    return NextResponse.json(await loadCart(session.user.id));
  } catch (err) {
    console.error("Error updating cart item:", err);
    return jsonError("Failed to update cart item", 500);
  }
};

export const DELETE = async (request: NextRequest) => {
  const { session, error } = await requireUser();
  if (error) return error;
  try {
    const itemId = new URL(request.url).searchParams.get("itemId");
    if (!itemId) return jsonError("Item ID is required", 400);

    const item = await findOwnItem(itemId, session.user.id);
    if (!item) return jsonError("Item not found in cart", 404);

    await prisma.cartItem.delete({ where: { id: itemId } });
    return NextResponse.json(await loadCart(session.user.id));
  } catch (err) {
    console.error("Error removing cart item:", err);
    return jsonError("Failed to remove item from cart", 500);
  }
};
