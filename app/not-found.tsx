import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-10">
      <Logo />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="display text-[clamp(8rem,30vw,20rem)] text-brand [-webkit-text-stroke:2px_hsl(var(--foreground))]">404</p>
        <h1 className="display text-4xl md:text-6xl">This shelf is empty.</h1>
        <p className="mt-3 max-w-sm text-lg text-muted-foreground">The page you&apos;re looking for has moved or never existed.</p>
        <Link href="/products" className={`${buttonVariants({ size: "lg" })} mt-8`}>Back to the shop</Link>
      </div>
    </div>
  );
}
