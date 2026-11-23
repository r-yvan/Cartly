import Link from "next/link";
import { Logo } from "@/components/logo";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/products?sort=newest", label: "New arrivals" },
      { href: "/cart", label: "Your cart" },
    ],
  },
  {
    title: "Sell",
    links: [
      { href: "/seller/register", label: "Open a store" },
      { href: "/seller/dashboard", label: "Seller hub" },
      { href: "/seller/products", label: "Manage products" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/auth/signin", label: "Sign in" },
      { href: "/auth/register", label: "Create account" },
      { href: "/buyer/orders", label: "Track an order" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t">
      <div className="container grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-muted-foreground">
            A marketplace for well-made everyday objects, sold directly by the people who make and source them.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="eyebrow">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-medium transition-colors hover:text-muted-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container overflow-hidden">
        <p aria-hidden className="display select-none pb-[0.12em] text-[23vw] leading-[0.95] text-foreground/[0.06] 2xl:text-[19rem]">
          cartly
        </p>
      </div>
      <div className="border-t">
        <div className="container flex flex-col justify-between gap-2 py-5 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Cartly. All rights reserved.</p>
          <p>Free shipping on orders over $150 · Pay on delivery</p>
        </div>
      </div>
    </footer>
  );
}
