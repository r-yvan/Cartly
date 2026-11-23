"use client";

import * as React from "react";
import { ProductImage } from "@/components/ui";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: { id: string; url: string }[]; name: string }) {
  const [active, setActive] = React.useState(0);
  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto md:flex-col md:overflow-visible">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "size-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all",
                i === active ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <ProductImage src={image.url} alt="" className="size-full" />
            </button>
          ))}
        </div>
      )}
      <div className="aspect-[4/5] flex-1 overflow-hidden rounded-4xl bg-muted">
        <ProductImage key={active} src={images[active]?.url} alt={name} priority className="size-full animate-fade-up" />
      </div>
    </div>
  );
}
