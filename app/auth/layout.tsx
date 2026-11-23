import { Check } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const POINTS = ["Pay only when your order arrives", "Follow every parcel step by step", "Open your own store in two minutes"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">{children}</div>
      </div>

      <aside className="relative m-3 hidden overflow-hidden rounded-4xl bg-brand p-12 text-brand-foreground lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="absolute inset-0 opacity-40 [background-image:radial-gradient(hsl(var(--brand-foreground)/0.35)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
        <p className="relative text-xs font-bold uppercase tracking-wide opacity-70">The Cartly marketplace</p>
        <div className="relative">
          <p className="display text-7xl xl:text-8xl">
            Good things,
            <br />
            well made.
          </p>
          <ul className="mt-10 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-lg font-bold">
                <span className="flex size-6 items-center justify-center rounded-full bg-brand-foreground text-brand">
                  <Check className="size-3.5" strokeWidth={3.5} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
