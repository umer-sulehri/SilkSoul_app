"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Sparkles, X } from "lucide-react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { Button } from "@/components/ui/button";
import { Price, StarRating, StockStatus } from "@/components/ui/price";
import { productThemeStyle } from "@/lib/product-theme";
import type { Product } from "@/types/catalog";

export function CompanionSpotlight({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const image = product.images[0];
  const specs = product.specifications.slice(0, 4);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <aside className="mt-6 overflow-hidden rounded-[18px] border border-primary/20 bg-surface-soft/70">
        <div className="flex items-center gap-4 p-4">
          <Link
            href={`/products/${product.slug}`}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[14px] border border-border bg-surface"
            aria-label={`View ${product.name}`}
          >
            {image ? (
              <Image
                src={image.path}
                alt={image.alt}
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            ) : null}
          </Link>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3 w-3 text-accent" aria-hidden="true" />
              Complete the ritual
            </p>
            <Link
              href={`/products/${product.slug}`}
              className="mt-1 block truncate font-serif text-lg leading-snug text-ink hover:text-primary"
            >
              {product.name}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Price
                amount={product.price}
                compareAt={product.compareAtPrice}
                currency={product.currency}
                size="sm"
              />
              <StockStatus
                available={product.availableStock}
                threshold={product.lowStockThreshold}
                className="text-xs"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 border-t border-border/70 bg-surface/50 p-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            Details
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <AddToCartButton product={product} size="sm" label="Add" />
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            className="companion-backdrop absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-label="Close companion product details"
            tabIndex={-1}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="companion-product-title"
            className="companion-panel absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-[-24px_0_70px_-40px_rgba(31,45,35,0.55)]"
            style={productThemeStyle(product.theme)}
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  <Sparkles className="h-3 w-3 text-accent" aria-hidden="true" />
                  Pairs beautifully with
                </p>
                <p className="mt-0.5 text-xs text-muted">{product.category?.name ?? "Haircare"}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label="Close details"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              <div className="product-stage relative aspect-[4/3] overflow-hidden rounded-[18px] border border-border">
                {image ? (
                  <Image
                    src={image.path}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 448px) 100vw, 448px"
                    className="object-contain p-6"
                  />
                ) : null}
              </div>

              <h2
                id="companion-product-title"
                className="mt-6 font-serif text-3xl leading-tight text-ink"
              >
                {product.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <StarRating rating={product.rating} />
                <span className="text-xs text-muted">{product.sku}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {product.description || product.shortDescription}
              </p>

              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3 border-y border-border py-4">
                <Price
                  amount={product.price}
                  compareAt={product.compareAtPrice}
                  currency={product.currency}
                  size="lg"
                />
                <StockStatus
                  available={product.availableStock}
                  threshold={product.lowStockThreshold}
                />
              </div>

              {product.benefits.length > 0 ? (
                <div className="mt-5">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                    Why it belongs in your ritual
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {product.benefits.slice(0, 4).map((benefit) => (
                      <li key={benefit} className="flex gap-2.5 text-sm text-muted">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {specs.length > 0 ? (
                <dl className="mt-5 grid grid-cols-2 gap-3">
                  {specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="rounded-[10px] border border-border bg-surface-soft/60 px-3 py-2"
                    >
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                        {spec.label}
                      </dt>
                      <dd className="mt-0.5 text-sm text-ink">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <Link
                href={`/products/${product.slug}`}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                View full product page
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="border-t border-border bg-surface px-5 py-4">
              <AddToCartButton
                product={product}
                size="lg"
                className="w-full"
                label="Add to cart"
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
