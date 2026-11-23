"use client";

import { Button } from "@/components/ui";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">Something broke</p>
      <h1 className="display mt-2 text-5xl md:text-7xl">We hit a snag.</h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        The page couldn&apos;t load. This is usually temporary, so trying again often fixes it.
      </p>
      {error.digest && <p className="mt-2 text-sm text-muted-foreground">Reference: {error.digest}</p>}
      <Button size="lg" className="mt-8" onClick={reset}>Try again</Button>
    </div>
  );
}
