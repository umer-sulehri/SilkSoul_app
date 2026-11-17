import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Price, StarRating, StockStatus } from "@/components/ui/price";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";

export function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  const image = product.images[0];
  const outOfStock = product.availableStock <= 0;
  const sizeEntry = product.specifications.find(
    (entry) => entry.label.toLowerCase() === "size",
  );
  const size = sizeEntry?.value.split("/")[0]?.trim();

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[24px] border border-border/80 bg-surface shadow-[0_20px_50px_-42px_rgba(31,45,35,0.45)] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_30px_65px_-40px_rgba(31,45,35,0.5)]",
        className,
      )}
    >
      <div className="product-stage relative aspect-[4/5] overflow-hidden border-b border-border/60">
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset"
          aria-label={`View ${product.name}`}
        >
          {image ? (
            <Image
              src={image.path}
              alt={image.alt}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
              className="object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : null}
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col gap-1.5">
          {outOfStock ? (
            <Badge tone="danger">Out of stock</Badge>
          ) : product.availableStock <= product.lowStockThreshold ? (
            <Badge tone="warning">Low stock</Badge>
          ) : null}
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface/90 text-ink opacity-0 backdrop-blur transition-opacity duration-200 hover:text-primary group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label={`Open ${product.name} details`}
          tabIndex={-1}
        >
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        {size ? (
          <span className="absolute bottom-3 left-3 z-20 rounded-full border border-border/80 bg-surface/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted backdrop-blur">
            {size}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            {product.category?.name ?? "Haircare"}
          </p>
          <StarRating rating={product.rating} className="scale-95" />
        </div>
        <h3 className="mt-2 font-serif text-xl leading-snug text-ink">
          <Link href={`/products/${product.slug}`} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {product.shortDescription}
        </p>
        <div className="mt-4 flex items-baseline justify-between gap-3">
          <Price amount={product.price} compareAt={product.compareAtPrice} currency={product.currency} />
          <StockStatus available={product.availableStock} threshold={product.lowStockThreshold} />
        </div>
        <div className="mt-5 flex gap-2">
          <AddToCartButton product={product} size="sm" className="flex-1" />
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-border bg-surface px-3 text-sm font-medium text-ink transition-colors hover:border-primary/25 hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Details
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
