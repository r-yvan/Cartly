import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn, statusLabel } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition-[transform,background-color,color,border-color,opacity] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/85",
        brand: "bg-brand text-brand-foreground hover:brightness-95",
        outline: "border border-input bg-transparent hover:bg-accent",
        ghost: "hover:bg-accent",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-14 px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { loading?: boolean };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";

const fieldClass =
  "w-full rounded-xl border border-input bg-card px-4 text-[15px] font-medium transition-colors placeholder:font-normal placeholder:text-muted-foreground/70 hover:border-foreground/30 focus-visible:border-foreground focus-visible:outline-none disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(fieldClass, "h-12", className)} {...props} />
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldClass, "min-h-28 resize-y py-3", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn(fieldClass, "select-chevron h-12 cursor-pointer appearance-none pr-10", className)} {...props} />
  )
);
Select.displayName = "Select";

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-3xl border bg-card text-card-foreground", className)} {...props} />;
}

const TONES = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  brand: "bg-brand text-brand-foreground",
} as const;

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof TONES }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold",
        TONES[tone],
        className
      )}
      {...props}
    />
  );
}

const STATUS_TONES: Record<string, keyof typeof TONES> = {
  DELIVERED: "success",
  PAID: "success",
  ACTIVE: "success",
  PENDING: "warning",
  PROCESSING: "warning",
  DRAFT: "neutral",
  ARCHIVED: "neutral",
  CANCELLED: "danger",
  FAILED: "danger",
  REFUNDED: "danger",
  OUT_OF_STOCK: "danger",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={STATUS_TONES[status] ?? "brand"}>
      <span className="size-1.5 rounded-full bg-current" />
      {statusLabel(status)}
    </Badge>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed px-6 py-16 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground [&_svg]:size-6">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-1.5 max-w-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Product photo with a quiet placeholder when a product has no image. */
export function ProductImage({
  src,
  alt,
  className,
  priority,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-sm font-bold text-muted-foreground", className)}>
        No photo
      </div>
    );
  }
  return (
    // Sellers can link images from any host, so the Next image optimizer isn't used here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("bg-muted object-cover", className)}
    />
  );
}
