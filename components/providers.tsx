"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart-context";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-right"
      toastOptions={{
        style: { fontFamily: "inherit", letterSpacing: "-0.04em", borderRadius: "1rem", fontWeight: 500 },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <CartProvider>{children}</CartProvider>
        <ThemedToaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
