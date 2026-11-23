import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth-forms";
import { oauthProviders, safeCallback } from "@/lib/auth-pages";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  return <RegisterForm callbackUrl={safeCallback(callbackUrl)} oauth={oauthProviders()} />;
}
