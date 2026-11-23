import type { Metadata } from "next";
import { SignInForm } from "@/components/auth-forms";
import { AUTH_ERRORS, oauthProviders, safeCallback } from "@/lib/auth-pages";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string }> }) {
  const { callbackUrl, error } = await searchParams;
  return (
    <SignInForm
      callbackUrl={safeCallback(callbackUrl)}
      oauth={oauthProviders()}
      initialError={error ? AUTH_ERRORS[error] ?? "We couldn't sign you in. Please try again." : undefined}
    />
  );
}
