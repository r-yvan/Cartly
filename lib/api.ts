import { NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import type { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";

export const getSession = () => getServerSession(authOptions);

export const jsonError = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

type Guard = { session: Session; error?: never } | { session?: never; error: NextResponse };

/** Resolves the signed-in user, optionally restricted to the given roles. */
export async function requireUser(...roles: Role[]): Promise<Guard> {
  const session = await getSession();
  if (!session?.user?.id) return { error: jsonError("Sign in to continue", 401) };
  if (roles.length && !roles.includes(session.user.role)) {
    return { error: jsonError("You don't have access to this", 403) };
  }
  return { session };
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
