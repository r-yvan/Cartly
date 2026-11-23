"use client";

import * as React from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { api } from "@/lib/fetcher";

export type SellerProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string | null;
  quantity: number;
  sku: string | null;
  status: string;
  categoryId: string | null;
  category: { name: string } | null;
  images: { url: string }[];
  _count: { orderItems: number };
};

type Category = { id: string; name: string };

/** Slide-over form used for both creating and editing a product. */
export function ProductForm({ product, onClose, onSaved }: { product: SellerProduct | null; onClose: () => void; onSaved: () => void }) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    api<Category[]>("/api/categories").then(setCategories).catch(() => setCategories([]));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const body = {
      id: product?.id,
      name: f.name,
      description: f.description,
      price: f.price,
      compareAtPrice: f.compareAtPrice || null,
      quantity: f.quantity || 0,
      sku: f.sku || null,
      categoryId: f.categoryId || null,
      status: f.status,
      images: f.images.split(/\s+/).filter(Boolean),
    };
    setSaving(true);
    try {
      await api("/api/seller/products", { method: product ? "PUT" : "POST", body });
      toast.success(product ? "Product updated" : "Product listed");
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={product ? "Edit product" : "Add product"}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 animate-in fade-in bg-black/50 backdrop-blur-sm" />
      <form onSubmit={submit} className="relative flex h-full w-full max-w-xl animate-in slide-in-from-right flex-col bg-background shadow-lift duration-300">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <h2 className="text-3xl font-black">{product ? "Edit product" : "Add a product"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-10 items-center justify-center rounded-full hover:bg-accent">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          <Field label="Name"><Input name="name" required minLength={2} maxLength={120} defaultValue={product?.name} placeholder="Walnut desk lamp" autoFocus /></Field>
          <Field label="Description"><Textarea name="description" required minLength={10} defaultValue={product?.description} placeholder="What is it, what is it made of, and why is it good?" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (USD)"><Input name="price" type="number" required min="0.01" step="0.01" defaultValue={product?.price} placeholder="49.00" /></Field>
            <Field label="Compare-at price" hint="Optional. Shown struck through."><Input name="compareAtPrice" type="number" min="0.01" step="0.01" defaultValue={product?.compareAtPrice ?? ""} /></Field>
            <Field label="Stock"><Input name="quantity" type="number" required min="0" step="1" defaultValue={product?.quantity ?? 1} /></Field>
            <Field label="SKU" hint="Optional."><Input name="sku" maxLength={60} defaultValue={product?.sku ?? ""} /></Field>
            <Field label="Category">
              <Select name="categoryId" defaultValue={product?.categoryId ?? ""} key={categories.length}>
                <option value="">No category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Visibility">
              <Select name="status" defaultValue={product?.status ?? "ACTIVE"}>
                <option value="ACTIVE">Live in the shop</option>
                <option value="DRAFT">Draft (hidden)</option>
                <option value="OUT_OF_STOCK">Out of stock</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </Field>
          </div>
          <Field label="Photo links" hint="One image URL per line, up to 6. The first is the cover photo.">
            <Textarea name="images" defaultValue={product?.images.map((i) => i.url).join("\n")} placeholder="https://…" className="font-mono text-sm" />
          </Field>
        </div>

        <div className="flex gap-3 border-t px-6 py-5">
          <Button type="button" variant="outline" size="lg" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="brand" size="lg" className="flex-1" loading={saving}>{product ? "Save changes" : "List product"}</Button>
        </div>
      </form>
    </div>
  );
}
