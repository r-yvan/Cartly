import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/prisma/client";
import { jsonError, requireUser } from "@/lib/api";

const roleSchema = z.enum(["USER", "SELLER", "ADMIN"]);

// GET - Fetch all users (admin only)
export const GET = async (request: NextRequest) => {
  const { error } = await requireUser("ADMIN");
  if (error) return error;
  try {
    const role = roleSchema.safeParse(new URL(request.url).searchParams.get("role"));
    const users = await prisma.user.findMany({
      where: role.success ? { role: role.data } : {},
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true, products: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    return jsonError("Failed to fetch users", 500);
  }
};

// PUT - Update a user's role
export const PUT = async (request: NextRequest) => {
  const { session, error } = await requireUser("ADMIN");
  if (error) return error;

  const parsed = z
    .object({ userId: z.string().min(1), role: roleSchema })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Choose a valid role", 400);
  const { userId, role } = parsed.data;

  // Stops an admin from locking themselves (and possibly everyone) out.
  if (userId === session.user.id) return jsonError("You can't change your own role", 400);

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json(user);
  } catch (err) {
    console.error("Error updating user:", err);
    return jsonError("Failed to update user", 500);
  }
};
