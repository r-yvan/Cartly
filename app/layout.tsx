import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import "./globals.css";

const satoshi = localFont({
  src: [
    { path: "../public/fonts/satoshi/Satoshi-Light.otf", weight: "300", style: "normal" },
    { path: "../public/fonts/satoshi/Satoshi-Regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/satoshi/Satoshi-Italic.otf", weight: "400", style: "italic" },
    { path: "../public/fonts/satoshi/Satoshi-Medium.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/satoshi/Satoshi-Bold.otf", weight: "700", style: "normal" },
    { path: "../public/fonts/satoshi/Satoshi-Black.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Cartly — Good things, well made", template: "%s · Cartly" },
  description: "A marketplace for well-made everyday objects, sold directly by independent sellers.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // next-themes sets the theme class on <html> before hydration.
    <html lang="en" className={satoshi.variable} suppressHydrationWarning>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
