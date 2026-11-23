import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/prisma/client";
import { jsonError } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

export const POST = async (request: NextRequest) => {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error.errors[0].message, 400);
    const { name, email, password } = parsed.data;

    if (await prisma.user.findUnique({ where: { email } })) {
      return jsonError("An account with this email already exists", 409);
    }

    const [firstName, ...rest] = name.split(" ");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
        profile: { create: { firstName, lastName: rest.join(" ") || null } },
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return jsonError("Could not create your account", 500);
  }
};
