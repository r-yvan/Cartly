"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export type CartLine = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string | number;
    quantity: number;
    trackQuantity: boolean;
    images: { url: string }[];
  };
};

type CartState = {
  items: CartLine[];
  count: number;
  subtotal: number;
  loading: boolean;
  add: (productId: string, quantity?: number) => Promise<boolean>;
  setQuantity: (itemId: string, quantity: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = React.createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const [items, setItems] = React.useState<CartLine[]>([]);
  const [loading, setLoading] = React.useState(true);

  /** Calls the cart API and replaces local state with the cart it returns. */
  const call = React.useCallback(async (input: string, init?: RequestInit) => {
    const res = await fetch(input, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Something went wrong");
    setItems(data.items ?? []);
  }, []);

  const refresh = React.useCallback(async () => {
    try {
      await call("/api/cart");
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [call]);

  React.useEffect(() => {
    if (status === "authenticated") refresh();
    if (status === "unauthenticated") {
      setItems([]);
      setLoading(false);
    }
  }, [status, refresh]);

  const add = React.useCallback(
    async (productId: string, quantity = 1) => {
      if (status !== "authenticated") {
        toast("Sign in to start a cart");
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return false;
      }
      try {
        await call("/api/cart", { method: "POST", body: JSON.stringify({ productId, quantity }) });
        toast.success("Added to cart", { action: { label: "View cart", onClick: () => router.push("/cart") } });
        return true;
      } catch (err) {
        toast.error((err as Error).message);
        return false;
      }
    },
    [status, call, router]
  );

  const setQuantity = React.useCallback(
    async (itemId: string, quantity: number) => {
      try {
        await call("/api/cart", { method: "PUT", body: JSON.stringify({ itemId, quantity }) });
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
    [call]
  );

  const remove = React.useCallback(
    async (itemId: string) => {
      try {
        await call(`/api/cart?itemId=${itemId}`, { method: "DELETE" });
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
    [call]
  );

  const value = React.useMemo<CartState>(
    () => ({
      items,
      loading,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),
      add,
      setQuantity,
      remove,
      refresh,
    }),
    [items, loading, add, setQuantity, remove, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
