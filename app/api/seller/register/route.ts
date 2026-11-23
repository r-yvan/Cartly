import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/prisma/client";
import { jsonError, requireUser, slugify } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Give your store a name").max(60),
  description: z.string().trim().max(500).optional(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(200).optional(),
});

// POST - Open a store and upgrade the signed-in user to a seller
export const POST = async (request: NextRequest) => {
  const { session, error } = await requireUser();
  if (error) return error;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.errors[0].message, 400);

  try {
    const userId = session.user.id;
    if (await prisma.store.findUnique({ where: { userId } })) {
      return jsonError("You already have a store", 409);
    }

    const base = slugify(parsed.data.name) || "store";
    const taken = await prisma.store.findUnique({ where: { slug: base } });
    const slug = taken ? `${base}-${Date.now().toString(36)}` : base;

    const [store] = await prisma.$transaction([
      prisma.store.create({
        data: { ...parsed.data, slug, userId, email: session.user.email ?? null },
      }),
      // Admins keep their role; everyone else becomes a seller.
      prisma.user.updateMany({ where: { id: userId, role: "USER" }, data: { role: "SELLER" } }),
    ]);
    return NextResponse.json(store, { status: 201 });
  } catch (err) {
    console.error("Error creating store:", err);
    return jsonError("Failed to create your store", 500);
  }
};
