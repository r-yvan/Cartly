"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, LogOut, Menu, Package, Search, ShieldCheck, ShoppingBag, Store, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/components/cart-context";
import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/products?sort=newest", label: "New in" },
  { href: "/seller/register", label: "Sell" },
];

export function accountLinks(role?: string) {
  return [
    role === "ADMIN" && { href: "/admin/dashboard", label: "Admin", icon: ShieldCheck },
    role === "SELLER" || role === "ADMIN"
      ? { href: "/seller/dashboard", label: "Seller hub", icon: Store }
      : { href: "/seller/register", label: "Start selling", icon: Store },
    { href: "/buyer/dashboard", label: "My account", icon: LayoutDashboard },
    { href: "/buyer/orders", label: "My orders", icon: Package },
  ].filter(Boolean) as { href: string; label: string; icon: typeof Store }[];
}

export function Avatar({ name, image, className }: { name?: string | null; image?: string | null; className?: string }) {
  const initials = (name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt="" referrerPolicy="no-referrer" className={cn("size-9 rounded-full object-cover", className)} />
  ) : (
    <span className={cn("flex size-9 items-center justify-center rounded-full bg-foreground text-xs font-black text-background", className)}>
      {initials}
    </span>
  );
}

function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!session?.user) return null;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="ml-1 rounded-full ring-offset-2 ring-offset-background transition-shadow hover:ring-2 hover:ring-border"
      >
        <Avatar name={session.user.name} image={session.user.image} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 z-50 w-64 origin-top-right animate-fade-up rounded-2xl border bg-popover p-2 shadow-lift [animation-duration:180ms]">
          <div className="px-3 pb-3 pt-2">
            <p className="truncate font-bold">{session.user.name ?? "Welcome"}</p>
            <p className="truncate text-sm text-muted-foreground">{session.user.email}</p>
          </div>
          <div className="border-t pt-2">
            {accountLinks(session.user.role).map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors hover:bg-accent"
              >
                <Icon className="size-4 text-muted-foreground" />
                {label}
              </Link>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { status } = useSession();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="rounded-full px-3.5 py-2 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-0.5">
          <Link href="/products" aria-label="Search products" className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-accent">
            <Search className="size-[18px]" />
          </Link>
          <ThemeToggle />
          <Link href="/cart" aria-label={`Cart, ${count} items`} className="relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-accent">
            <ShoppingBag className="size-[18px]" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-black text-brand-foreground">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
          {status === "authenticated" ? (
            <UserMenu />
          ) : (
            status === "unauthenticated" && (
              <Link href="/auth/signin" className={cn(buttonVariants({ size: "sm" }), "ml-2 hidden sm:inline-flex")}>
                Sign in
              </Link>
            )
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-accent md:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="container flex flex-col gap-1 border-t py-4 md:hidden" aria-label="Mobile">
          {LINKS.map(({ href, label }) => (
            <Link key={label} href={href} className="rounded-xl px-3 py-3 text-2xl font-black tracking-tighter hover:bg-accent">
              {label}
            </Link>
          ))}
          {status === "unauthenticated" && (
            <Link href="/auth/signin" className={cn(buttonVariants({ size: "lg" }), "mt-3")}>
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
