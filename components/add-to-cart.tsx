"use client";

import * as React from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui";

export function QuantityStepper({
  value,
  onChange,
  max,
  disabled,
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const side = size === "sm" ? "size-9" : "size-12";
  return (
    <div className="inline-flex items-center rounded-full border bg-card">
      <button type="button" aria-label="Decrease quantity" disabled={disabled || value <= 1} onClick={() => onChange(value - 1)} className={`${side} flex items-center justify-center rounded-full transition-colors hover:bg-accent disabled:opacity-30`}>
        <Minus className="size-4" />
      </button>
      <span className="w-8 text-center font-black tabular-nums" aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" disabled={disabled || (max !== undefined && value >= max)} onClick={() => onChange(value + 1)} className={`${side} flex items-center justify-center rounded-full transition-colors hover:bg-accent disabled:opacity-30`}>
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function AddToCart({ productId, max, soldOut }: { productId: string; max?: number; soldOut: boolean }) {
  const { add } = useCart();
  const [quantity, setQuantity] = React.useState(1);
  const [adding, setAdding] = React.useState(false);

  if (soldOut) {
    return (
      <Button size="lg" disabled className="w-full">
        Sold out
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <QuantityStepper value={quantity} onChange={setQuantity} max={max} />
      <Button
        size="lg"
        variant="brand"
        className="flex-1"
        loading={adding}
        onClick={async () => {
          setAdding(true);
          await add(productId, quantity);
          setAdding(false);
        }}
      >
        {!adding && <ShoppingBag />}
        Add to cart
      </Button>
    </div>
  );
}
