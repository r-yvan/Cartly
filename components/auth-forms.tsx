"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import { api } from "@/lib/fetcher";

type Props = { callbackUrl: string; oauth: string[]; initialError?: string };

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 16 16" className="size-[18px]" fill="currentColor" aria-hidden>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

function ErrorNote({ message }: { message: string }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

function OAuthButtons({ oauth, callbackUrl }: Pick<Props, "oauth" | "callbackUrl">) {
  const [pending, setPending] = React.useState<string | null>(null);
  if (oauth.length === 0) return null;
  const start = (provider: string) => {
    setPending(provider);
    signIn(provider, { callbackUrl });
  };
  return (
    <>
      <div className="space-y-2.5">
        {oauth.includes("google") && (
          <Button type="button" variant="outline" size="lg" className="w-full bg-card" loading={pending === "google"} onClick={() => start("google")}>
            {pending !== "google" && <GoogleIcon />} Continue with Google
          </Button>
        )}
        {oauth.includes("github") && (
          <Button type="button" variant="outline" size="lg" className="w-full bg-card" loading={pending === "github"} onClick={() => start("github")}>
            {pending !== "github" && <GitHubIcon />} Continue with GitHub
          </Button>
        )}
      </div>
      <div className="my-6 flex items-center gap-4 text-sm text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
      </div>
    </>
  );
}

export function SignInForm({ callbackUrl, oauth, initialError }: Props) {
  const router = useRouter();
  const [error, setError] = React.useState(initialError ?? "");
  const [loading, setLoading] = React.useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      redirect: false,
      email: form.get("email"),
      password: form.get("password"),
    });
    if (result?.error) {
      setError(result.error === "CredentialsSignin" ? "Incorrect email or password" : result.error);
      setLoading(false);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <>
      <h1 className="display text-6xl">Welcome back.</h1>
      <p className="mt-3 text-lg text-muted-foreground">Sign in to pick up where you left off.</p>
      <div className="mt-9">
        <OAuthButtons oauth={oauth} callbackUrl={callbackUrl} />
        <form onSubmit={submit} className="space-y-4">
          {error && <ErrorNote message={error} />}
          <Field label="Email"><Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></Field>
          <Field label="Password"><Input name="password" type="password" required autoComplete="current-password" placeholder="Your password" /></Field>
          <Button type="submit" size="lg" className="w-full" loading={loading}>Sign in</Button>
        </form>
        <p className="mt-6 text-center text-muted-foreground">
          New to Cartly?{" "}
          <Link href={`/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-bold text-foreground underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </>
  );
}

export function RegisterForm({ callbackUrl, oauth }: Props) {
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { name, email, password } = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    setLoading(true);
    setError("");
    try {
      await api("/api/register", { method: "POST", body: { name, email, password } });
      const result = await signIn("credentials", { redirect: false, email, password });
      if (result?.error) throw new Error("Account created. Please sign in.");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="display text-6xl">Join Cartly.</h1>
      <p className="mt-3 text-lg text-muted-foreground">One account to shop, track orders and sell.</p>
      <div className="mt-9">
        <OAuthButtons oauth={oauth} callbackUrl={callbackUrl} />
        <form onSubmit={submit} className="space-y-4">
          {error && <ErrorNote message={error} />}
          <Field label="Full name"><Input name="name" required minLength={2} autoComplete="name" placeholder="Ada Lovelace" /></Field>
          <Field label="Email"><Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></Field>
          <Field label="Password" hint="At least 8 characters.">
            <Input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="Create a password" />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={loading}>Create account</Button>
        </form>
        <p className="mt-6 text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-bold text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
