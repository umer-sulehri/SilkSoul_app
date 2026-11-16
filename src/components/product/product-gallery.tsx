"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/catalog";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] border border-border bg-surface-soft">
        {current ? (
          <Image
            src={current.path}
            alt={current.alt || productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-contain p-4 sm:p-8"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4">
          <span className="rounded-full border border-border bg-surface/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted backdrop-blur">
            Actual label · {productName}
          </span>
        </div>
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3" role="group" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-[12px] border bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                index === active ? "border-primary" : "border-border hover:border-primary/40",
              )}
              aria-label={`Show image ${index + 1} of ${productName}`}
            >
              <Image
                src={image.path}
                alt=""
                fill
                sizes="120px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
