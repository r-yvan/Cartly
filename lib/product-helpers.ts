// Pure helpers shared by server pages and client components.
type Stock = { trackQuantity: boolean; quantity: number; status: string };
type Pricing = { price: number; compareAtPrice: number | null };

export const isSoldOut = (p: Stock) => p.status === "OUT_OF_STOCK" || (p.trackQuantity && p.quantity <= 0);

export const discountOf = (p: Pricing) =>
  p.compareAtPrice && p.compareAtPrice > p.price ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0;
