"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ArrowLeft, BarChart3, LayoutDashboard, LogOut, Package, RefreshCw, ShoppingCart, Users, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/navbar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

const AREAS = {
  buyer: {
    label: "My account",
    nav: [
      { href: "/buyer/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/buyer/orders", label: "Orders", icon: Package },
    ],
  },
  seller: {
    label: "Seller hub",
    nav: [
      { href: "/seller/dashboard", label: "Overview", icon: BarChart3 },
      { href: "/seller/products", label: "Products", icon: Package },
      { href: "/seller/orders", label: "Orders", icon: ShoppingCart },
    ],
  },
  admin: {
    label: "Admin",
    nav: [
      { href: "/admin/dashboard", label: "Overview", icon: BarChart3 },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    ],
  },
} satisfies Record<string, { label: string; nav: { href: string; label: string; icon: LucideIcon }[] }>;

export function DashboardShell({ area, children }: { area: keyof typeof AREAS; children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { label, nav } = AREAS[area];

  const links = (mobile: boolean) =>
    nav.map(({ href, label: text, icon: Icon }) => {
      const active = pathname.startsWith(href);
      return (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 whitespace-nowrap rounded-xl font-bold transition-colors",
            mobile ? "px-4 py-2 text-sm" : "px-3 py-2.5",
            active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Icon className="size-[18px]" />
          {text}
        </Link>
      );
    });

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r p-5 lg:flex">
        <Logo />
        <p className="eyebrow mb-3 mt-10 px-3">{label}</p>
        <nav className="flex flex-col gap-1" aria-label={label}>{links(false)}</nav>
        <div className="mt-auto space-y-3">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <ArrowLeft className="size-[18px]" /> Back to store
          </Link>
          <div className="flex items-center gap-3 rounded-2xl border bg-card p-3">
            <Avatar name={session?.user?.name} image={session?.user?.image} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{session?.user?.name ?? "Account"}</p>
              <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
            <button type="button" onClick={() => signOut({ callbackUrl: "/" })} aria-label="Sign out" className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="size-4" />
            </button>
          </div>
          <div className="flex items-center justify-between px-3 text-sm text-muted-foreground">
            Theme <ThemeToggle className="size-8" />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl lg:hidden">
          <div className="flex h-14 items-center justify-between px-5">
            <Logo />
            <div className="flex items-center">
              <ThemeToggle />
              <button type="button" onClick={() => signOut({ callbackUrl: "/" })} aria-label="Sign out" className="flex size-10 items-center justify-center rounded-full hover:bg-accent">
                <LogOut className="size-[18px]" />
              </button>
            </div>
          </div>
          <nav className="no-scrollbar flex gap-1.5 overflow-x-auto px-5 pb-3" aria-label={label}>{links(true)}</nav>
        </header>
        <main className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-10 lg:py-12">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-1.5 text-5xl md:text-6xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, highlight }: { label: string; value: React.ReactNode; hint?: string; icon: LucideIcon; highlight?: boolean }) {
  return (
    <Card className={cn("p-5", highlight && "border-brand bg-brand text-brand-foreground")}>
      <div className="flex items-center justify-between">
        <p className={cn("text-sm font-bold", highlight ? "opacity-70" : "text-muted-foreground")}>{label}</p>
        <Icon className={cn("size-[18px]", highlight ? "opacity-70" : "text-muted-foreground")} />
      </div>
      <p className="mt-6 text-4xl font-black tracking-tightest">{value}</p>
      {hint && <p className={cn("mt-1 text-sm", highlight ? "opacity-70" : "text-muted-foreground")}>{hint}</p>}
    </Card>
  );
}

/** Standard loading and error states for dashboard data. */
export function LoadState({ loading, error, onRetry, rows = 3 }: { loading: boolean; error: string | null; onRetry: () => void; rows?: number }) {
  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading">
        {Array.from({ length: rows }, (_, i) => <div key={i} className="skeleton h-24" />)}
      </div>
    );
  }
  if (error) {
    return (
      <Card className="flex flex-col items-center px-6 py-12 text-center">
        <p className="text-xl font-black">We couldn&apos;t load this</p>
        <p className="mt-1 text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-5" onClick={onRetry}><RefreshCw /> Try again</Button>
      </Card>
    );
  }
  return null;
}

export function TableCard({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left">
          <thead>
            <tr className="border-b">
              {head.map((h) => (
                <th key={h} className="eyebrow whitespace-nowrap px-5 py-4 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y [&_td]:px-5 [&_td]:py-4">{children}</tbody>
        </table>
      </div>
    </Card>
  );
}
