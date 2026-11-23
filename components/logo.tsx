import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)} aria-label="Cartly home">
      <span className="flex size-8 items-center justify-center rounded-[10px] bg-brand text-brand-foreground transition-transform duration-300 group-hover:-rotate-12">
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 4h2.5l2.2 10.2a1.6 1.6 0 0 0 1.6 1.3h7.6a1.6 1.6 0 0 0 1.5-1.2L20 8H7" />
          <circle cx="9.5" cy="19.5" r="1.1" fill="currentColor" />
          <circle cx="17" cy="19.5" r="1.1" fill="currentColor" />
        </svg>
      </span>
      <span className="text-[22px] font-black tracking-tighter">cartly</span>
    </Link>
  );
}
