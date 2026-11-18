"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Leaf, Pause, Play } from "lucide-react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { Price } from "@/components/ui/price";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";

const AUTO_ADVANCE_MS = 6_000;

export function MobileHeroSlider({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = products.length;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || userPaused || reducedMotion || count < 2) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, userPaused, reducedMotion, count]);

  if (count === 0) return null;

  const goTo = (next: number) => {
    setIndex(((next % count) + count) % count);
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    setPaused(true);
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current;
    if (start !== null) {
      const delta = (event.changedTouches[0]?.clientX ?? start) - start;
      if (Math.abs(delta) > 40) goTo(index + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
    setPaused(false);
  };

  return (
    <section className="herbal-wash relative overflow-hidden pb-10 pt-6 sm:hidden">
      <Leaf
        className="pointer-events-none absolute -right-12 -top-10 h-56 w-56 rotate-12 text-primary/[0.05]"
        strokeWidth={1}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
        aria-hidden="true"
      />
      <Container className="relative">
        <div className="overflow-hidden rounded-[24px] border border-border/70 bg-surface/85 p-2.5 shadow-[0_24px_60px_-45px_rgba(31,45,35,0.6)] ring-1 ring-white/70">
          <div
            className="flex touch-pan-y"
            style={{
              transform: `translateX(-${index * 100}%)`,
              transition: reducedMotion
                ? "none"
                : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="group"
            aria-label="Featured products"
          >
            {products.map((product, slideIndex) => {
              const image = product.images[0];
              return (
                <div key={product.id} className="w-full shrink-0 px-0.5">
                  <Link
                    href={`/products/${product.slug}`}
                    tabIndex={slideIndex === index ? 0 : -1}
                    aria-label={`View ${product.name}`}
                    className="product-stage relative mx-auto block aspect-[4/5] w-full max-w-[290px] overflow-hidden rounded-[20px] border border-border/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    {image ? (
                      <Image
                        src={image.path}
                        alt={image.alt}
                        fill
                        priority={slideIndex === 0}
                        sizes="100vw"
                        className="object-contain p-5"
                      />
                    ) : null}
                  </Link>

                  <div className="mt-4 px-1 text-center">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary">
                      {product.category?.name ?? "Haircare"}
                    </p>
                    <h2 className="mt-1.5 font-serif text-2xl leading-tight text-ink">
                      {product.name}
                    </h2>
                    <p className="mx-auto mt-1.5 line-clamp-2 max-w-[290px] text-xs leading-relaxed text-muted">
                      {product.shortDescription}
                    </p>
                    <Price
                      amount={product.price}
                      compareAt={product.compareAtPrice}
                      currency={product.currency}
                      size="sm"
                      className="mt-2 justify-center"
                    />
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <AddToCartButton
                        product={product}
                        size="sm"
                        label="Add to bag"
                        className="min-w-[132px]"
                      />
                      <Link
                        href={`/products/${product.slug}`}
                        tabIndex={slideIndex === index ? 0 : -1}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "shrink-0",
                        )}
                      >
                        View
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {count > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="flex items-center gap-2" role="group" aria-label="Choose product">
              {products.map((product, indicatorIndex) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => goTo(indicatorIndex)}
                  aria-pressed={indicatorIndex === index}
                  aria-label={`Show ${product.name}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    indicatorIndex === index
                      ? "w-7 bg-primary"
                      : "w-2.5 bg-border hover:bg-muted/60",
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] tabular-nums text-muted">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => setUserPaused((value) => !value)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label={userPaused ? "Resume product slider" : "Pause product slider"}
            >
              {userPaused ? (
                <Play className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Pause className="h-3 w-3" aria-hidden="true" />
              )}
            </button>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
