import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui";
import { AUTH_ERRORS } from "@/lib/auth-pages";

export const metadata: Metadata = { title: "Sign-in problem" };

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
      <p className="eyebrow">Sign-in problem</p>
      <h1 className="display mt-2 text-6xl">That didn&apos;t work.</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {(error && AUTH_ERRORS[error]) ?? "Something went wrong while signing you in. Please try again."}
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/auth/signin" className={buttonVariants({ size: "lg" })}>Try again</Link>
        <Link href="/" className={buttonVariants({ size: "lg", variant: "outline" })}>Back to the store</Link>
      </div>
    </>
  );
}
