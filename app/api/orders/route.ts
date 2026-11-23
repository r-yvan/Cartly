import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import prisma from "@/prisma/client";
import { jsonError, requireUser } from "@/lib/api";
import { shippingFor } from "@/lib/utils";

/** A trimmed string that must be present, with the same message whether it's missing or too short. */
const required = (message: string, min = 1) => z.string({ required_error: message }).trim().min(min, message);

const addressSchema = z.object({
  firstName: required("Enter your first name"),
  lastName: required("Enter your last name"),
  address1: required("Enter your street address", 3),
  address2: z.string().trim().optional(),
  city: required("Enter your city"),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  country: required("Enter your country", 2),
  phone: required("Enter a phone number for delivery", 6),
});

const schema = z.object({
  shippingAddress: addressSchema,
  customerNote: z.string().trim().max(500).optional(),
});

class CheckoutError extends Error {}

const addressLine = (a: z.infer<typeof addressSchema>) =>
  [a.address1, a.address2, a.city, a.state, a.postalCode, a.country].filter(Boolean).join(", ");

// POST - Turn the signed-in user's cart into an order.
// Payment is collected on delivery; there is no card processor wired in yet.
export const POST = async (request: NextRequest) => {
  const { session, error } = await requireUser();
  if (error) return error;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.errors[0].message, 400);
  const { shippingAddress, customerNote } = parsed.data;
  const userId = session.user.id;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });
      if (!cart?.items.length) throw new CheckoutError("Your cart is empty");

      for (const { product, quantity } of cart.items) {
        if (product.status !== "ACTIVE") {
          throw new CheckoutError(`${product.name} is no longer available`);
        }
        if (product.trackQuantity) {
          // Conditional decrement: fails cleanly if someone else bought the last units first.
          const { count } = await tx.product.updateMany({
            where: { id: product.id, quantity: { gte: quantity } },
            data: { quantity: { decrement: quantity } },
          });
          if (count === 0) throw new CheckoutError(`Not enough stock left for ${product.name}`);
        }
      }

      const subtotal = cart.items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
      const shipping = shippingFor(subtotal);
      const destination = { address: addressLine(shippingAddress) };
      const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      const created = await tx.order.create({
        data: {
          orderNumber: `CT-${randomBytes(4).toString("hex").toUpperCase()}`,
          userId,
          subtotal,
          shipping,
          tax: 0,
          total: subtotal + shipping,
          shippingAddress,
          billingAddress: shippingAddress,
          paymentMethod: "PAY_ON_DELIVERY",
          customerNote: customerNote || null,
          estimatedDelivery,
          items: {
            create: cart.items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              quantity: i.quantity,
              price: i.product.price,
              selectedOptions: i.selectedOptions ?? undefined,
            })),
          },
        },
      });

      await tx.orderTracking.create({
        data: {
          orderId: created.id,
          status: "PENDING",
          currentLocation: { address: "Seller warehouse" },
          destination,
          estimatedTime: estimatedDelivery,
          updates: {
            create: {
              status: "PENDING",
              location: { address: "Seller warehouse" },
              description: "Order placed. Waiting for the seller to confirm.",
            },
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });

    return NextResponse.json({ id: order.id, orderNumber: order.orderNumber }, { status: 201 });
  } catch (err) {
    if (err instanceof CheckoutError) return jsonError(err.message, 409);
    console.error("Error placing order:", err);
    return jsonError("We couldn't place your order. Please try again.", 500);
  }
};
