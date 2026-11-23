import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** Formats a price; accepts Prisma Decimals, which arrive over JSON as strings. */
export const formatPrice = (value: unknown) => currency.format(Number(value) || 0);

export const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const FREE_SHIPPING_THRESHOLD = 150;
export const SHIPPING_FLAT_RATE = 12;

export const shippingFor = (subtotal: number) =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;

export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

export const statusLabel = (status: string) =>
  status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
