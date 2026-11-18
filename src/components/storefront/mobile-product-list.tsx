import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { Container } from "@/components/ui/layout";
import { Price } from "@/components/ui/price";
import type { Product } from "@/types/catalog";

export function MobileProductList({ products }: { products: Product[] }) {
  return (
    <section className="border-t border-border/80 bg-surface-soft/40 py-10 sm:hidden">
      <Container>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Shop SilkSoul
            </p>
            <h2 className="mt-2 font-serif text-3xl leading-tight text-ink">
              Choose your ritual.
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex shrink-0 items-center gap-1 pb-1 text-xs font-semibold text-primary"
          >
            All products
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="mt-6 rounded-[18px] border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
            Products are being prepared. Please check back shortly.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {products.map((product) => {
              const image = product.images[0];
              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-[20px] border border-border/80 bg-surface shadow-[0_18px_45px_-36px_rgba(31,45,35,0.5)]"
                >
                  <div className="flex gap-3 p-3">
                    <Link
                      href={`/products/${product.slug}`}
                      className="product-stage relative h-24 w-24 shrink-0 overflow-hidden rounded-[14px] border border-border/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      aria-label={`View ${product.name}`}
                    >
                      {image ? (
                        <Image
                          src={image.path}
                          alt={image.alt}
                          fill
                          sizes="96px"
                          className="object-contain p-2"
                        />
                      ) : null}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-primary">
                        {product.category?.name ?? "Haircare"}
                      </p>
                      <h3 className="mt-1 font-serif text-lg leading-tight text-ink">
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                        {product.shortDescription}
                      </p>
                      <Price
                        amount={product.price}
                        compareAt={product.compareAtPrice}
                        currency={product.currency}
                        size="sm"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-border/70 p-3">
                    <AddToCartButton
                      product={product}
                      size="sm"
                      label="Add to bag"
                      className="flex-1"
                    />
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-3 text-xs font-medium text-ink transition-colors hover:border-primary/25 hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      Details
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
