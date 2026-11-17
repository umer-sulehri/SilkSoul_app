import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/catalog";

type ProductSwitcherProps = {
  products: Product[];
  currentId: string;
  className?: string;
};

function ProductRailCard({
  product,
  current,
  index,
  compact = false,
}: {
  product: Product;
  current: boolean;
  index: number;
  compact?: boolean;
}) {
  const image = product.images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      aria-current={current ? "page" : undefined}
      className={cn(
        "group block overflow-hidden rounded-[18px] border bg-surface/85 transition-[border-color,box-shadow,transform] duration-300",
        current
          ? "border-primary/60 shadow-[0_18px_45px_-30px_rgba(31,45,35,0.38)]"
          : "border-border/80 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_18px_40px_-32px_rgba(31,45,35,0.45)]",
        compact ? "w-[210px] shrink-0" : "",
      )}
    >
      <div className="product-stage relative aspect-[5/4] overflow-hidden border-b border-border/60">
        {image ? (
          <Image
            src={image.path}
            alt={image.alt}
            fill
            sizes={compact ? "210px" : "180px"}
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : null}
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-border/80 bg-surface/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted backdrop-blur">
          {current ? (
            <>
              <Check className="h-2.5 w-2.5 text-primary" aria-hidden="true" />
              Viewing
            </>
          ) : (
            `0${index + 1}`
          )}
        </span>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 min-h-9 font-serif text-sm leading-snug text-ink">
          {product.name}
        </p>
        <p className="mt-1.5 text-[11px] font-medium tabular-nums text-primary">
          {formatCurrency(product.price, product.currency)}
        </p>
      </div>
    </Link>
  );
}

export function ProductSwitcherRail({
  products,
  currentId,
  className,
}: ProductSwitcherProps) {
  if (products.length < 2) return null;

  const currentIndex = Math.max(
    0,
    products.findIndex((product) => product.id === currentId),
  );

  return (
    <aside
      className={cn("hidden self-start xl:block", className)}
      aria-label="Product collection"
      data-product-switcher="rail"
    >
      <div className="sticky top-24">
        <div className="mb-4 flex items-end justify-between gap-2 border-b border-border/70 pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              The collection
            </p>
            <p className="mt-1 font-serif text-lg text-ink">Choose your ritual</p>
          </div>
          <span className="pb-0.5 text-[10px] tabular-nums text-muted">
            0{currentIndex + 1}/0{products.length}
          </span>
        </div>
        <div className="space-y-3">
          {products.map((product, index) => (
            <ProductRailCard
              key={product.id}
              product={product}
              current={product.id === currentId}
              index={index}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

export function ProductSwitcherStrip({
  products,
  currentId,
  className,
}: ProductSwitcherProps) {
  if (products.length < 2) return null;

  return (
    <div className={cn("xl:hidden", className)} data-product-switcher="strip">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          The collection
        </p>
        <p className="text-[11px] text-muted">Tap a product to switch</p>
      </div>
      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
        {products.map((product, index) => (
          <ProductRailCard
            key={product.id}
            product={product}
            current={product.id === currentId}
            index={index}
            compact
          />
        ))}
      </div>
    </div>
  );
}
