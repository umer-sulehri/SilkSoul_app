"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Leaf, Pause, Play } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/catalog";

const AUTO_ADVANCE_MS = 15_000;

export function HeroProductFlipper({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const count = products.length;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    function onVisibility() {
      setTabHidden(document.visibilityState === "hidden");
    }
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (paused || tabHidden || userPaused || reducedMotion || count < 2) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, tabHidden, userPaused, reducedMotion, count]);

  if (count === 0) return null;

  const product = products[index] ?? products[0];
  if (!product) return null;

  const select = (next: number) => {
    setIndex(((next % count) + count) % count);
  };

  const onBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setPaused(false);
    }
  };

  return (
    <section className="herbal-wash relative overflow-hidden pb-20 pt-10 sm:pt-14 lg:pb-28 lg:pt-20">
      <Leaf
        className="pointer-events-none absolute -left-16 top-24 h-80 w-80 -rotate-12 text-primary/[0.045]"
        strokeWidth={1}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-accent/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="mx-auto grid w-full max-w-[1280px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
        <div className="animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur">
            <Leaf className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
            Botanical haircare, made with care
          </p>
          <h1 className="mt-6 font-serif text-[clamp(2.9rem,7vw,5.3rem)] leading-[0.98] tracking-[-0.02em] text-ink">
            Let nature love
            <br />
            <span className="italic text-primary">your hair.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Gentle oils and milky extracts, blended into a simple ritual for softer,
            stronger-looking hair. Nothing loud. Just considered care.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "group")}>
              Shop now
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="#featured-products"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "bg-transparent")}
            >
              Discover our products
            </Link>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
            {[
              { value: "7", label: "Botanical oils" },
              { value: "0%", label: "Sulphates" },
              { value: "All", label: "Hair types" },
            ].map((item) => (
              <div key={item.label}>
                <dt className="font-serif text-2xl text-ink">{item.value}</dt>
                <dd className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div
          className="relative mx-auto w-full max-w-[480px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={onBlur}
        >
          <div
            className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 rounded-[48px_48px_28px_28px] border border-accent/20"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-[48px_48px_28px_28px] border border-primary/10 bg-surface p-2.5 shadow-[0_36px_90px_-52px_rgba(31,45,35,0.65)] ring-1 ring-white/70">
            <div className="product-stage relative aspect-[4/5] overflow-hidden rounded-[40px_40px_20px_20px]">
              {products.map((item, slideIndex) => {
                const image = item.images[0];
                if (!image) return null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => select(index + 1)}
                    className={cn(
                      "absolute inset-0 cursor-pointer transition-opacity duration-700 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-inset",
                      slideIndex === index
                        ? "z-10 opacity-100"
                        : "pointer-events-none z-0 opacity-0",
                      reducedMotion && "transition-none",
                    )}
                    tabIndex={slideIndex === index ? 0 : -1}
                    aria-label={`Show the next product (currently ${item.name})`}
                  >
                    <Image
                      src={image.path}
                      alt={image.alt}
                      fill
                      priority={slideIndex === 0}
                      sizes="(max-width: 1024px) 90vw, 480px"
                      className="object-contain p-6 sm:p-10"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4 px-1">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                {product.category?.name ?? "Haircare"}
              </p>
              <h2 className="mt-1.5 truncate font-serif text-2xl leading-tight text-ink">
                {product.name}
              </h2>
              <p className="mt-1.5 text-sm font-semibold tabular-nums text-muted">
                {formatCurrency(product.price, product.currency)}
              </p>
            </div>
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex shrink-0 items-center gap-1.5 pb-1 text-xs font-semibold text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              View product
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {count > 1 ? (
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-border/70 pt-3">
              <div className="flex items-center gap-2" role="group" aria-label="Hero products">
                {products.map((item, indicatorIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => select(indicatorIndex)}
                    aria-pressed={indicatorIndex === index}
                    aria-label={`Show ${item.name}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      indicatorIndex === index
                        ? "w-7 bg-primary"
                        : "w-2.5 bg-border hover:bg-muted/60",
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tabular-nums text-muted">
                  {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setUserPaused((value) => !value);
                    setPaused(false);
                  }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label={userPaused ? "Resume product rotation" : "Pause product rotation"}
                >
                  {userPaused ? (
                    <Play className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Pause className="h-3 w-3" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
