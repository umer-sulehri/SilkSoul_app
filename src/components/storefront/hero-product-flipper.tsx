"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Leaf, Pause, Play, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { StarRating } from "@/components/ui/price";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/catalog";

const AUTO_ADVANCE_MS = 15_000;

export function HeroProductFlipper({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

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
    if (paused || tabHidden || userPaused || count < 2) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [index, resetKey, paused, tabHidden, userPaused, count]);

  if (count === 0) return null;

  const product = products[index] ?? products[0];
  if (!product) return null;

  const select = (next: number) => {
    setIndex(((next % count) + count) % count);
    setResetKey((key) => key + 1);
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
          ref={stageRef}
          className="relative mx-auto w-full max-w-[520px] lg:max-w-none"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={onBlur}
        >
          <div className="grain relative overflow-hidden rounded-[30px] border border-primary/15 bg-surface-soft shadow-[0_32px_80px_-48px_rgba(31,45,35,0.6)] ring-1 ring-white/70">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                The SilkSoul edit
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-ink">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Featured
              </span>
            </div>

            <div className="product-stage relative aspect-[4/5] w-full sm:aspect-[5/5.2]">
              {products.map((item, slideIndex) => {
                const image = item.images[0];
                if (!image) return null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => select(index + 1)}
                    className={cn(
                      "absolute inset-0 cursor-pointer transition-opacity duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-inset",
                      slideIndex === index
                        ? "z-10 opacity-100"
                        : "pointer-events-none z-0 opacity-0",
                      reducedMotion && "transition-none",
                    )}
                    tabIndex={slideIndex === index ? 0 : -1}
                    aria-label={`Show the next featured product (currently ${item.name})`}
                    title="Click to flip to the next product"
                  >
                    <Image
                      src={image.path}
                      alt={image.alt}
                      fill
                      priority={slideIndex === 0}
                      sizes="(max-width: 1024px) 90vw, 520px"
                      className="object-contain p-5 transition-transform duration-700 ease-out sm:p-8"
                    />
                  </button>
                );
              })}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-surface-soft via-surface-soft/85 to-transparent px-5 pb-5 pt-24">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                      {product.category?.name ?? "Haircare"}
                    </p>
                    <h2 className="mt-1.5 font-serif text-2xl leading-tight text-ink">
                      {product.name}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-sm font-semibold tabular-nums text-ink">
                        {formatCurrency(product.price, product.currency)}
                      </span>
                      <StarRating rating={product.rating} />
                    </div>
                  </div>
                  <Link
                    href={`/products/${product.slug}`}
                    className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-surface px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    View product
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            {count > 1 ? (
              <div className="h-0.5 w-full overflow-hidden bg-border/60" aria-hidden="true">
                <div
                  key={`${index}-${resetKey}-${paused || tabHidden || userPaused}`}
                  data-paused={paused || tabHidden || userPaused}
                  className="hero-progress h-full w-full bg-accent"
                  style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }}
                />
              </div>
            ) : null}

            <div className="flex items-center justify-between border-t border-border/70 px-5 py-3.5">
              <div className="flex items-center gap-2" role="group" aria-label="Featured products">
                {products.map((item, indicatorIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => select(indicatorIndex)}
                    aria-pressed={indicatorIndex === index}
                    aria-label={`Show ${item.name}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-soft",
                      indicatorIndex === index
                        ? "w-8 bg-primary"
                        : "w-2.5 bg-border hover:bg-muted/60",
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="mr-1 text-[10px] tabular-nums text-muted">
                  {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>
                {count > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setUserPaused((value) => !value);
                      setPaused(false);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label={userPaused ? "Resume featured product rotation" : "Pause featured product rotation"}
                  >
                    {userPaused ? (
                      <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => select(index - 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="Previous featured product"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => select(index + 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="Next featured product"
                >
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 -right-3 hidden rounded-full border border-border bg-surface px-4 py-2 text-[11px] font-medium text-muted shadow-sm sm:block">
            {userPaused ? "Rotation paused" : "Click product to flip · auto every 15s"}
          </div>
        </div>
      </div>
    </section>
  );
}
