import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Check,
  Leaf,
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { ProductCard } from "@/components/product/product-card";
import { CompanionSpotlight } from "@/components/product/companion-spotlight";
import { ReviewForm } from "@/components/reviews/review-form";
import { Price, StarRating } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { Accordion } from "@/components/ui/accordion";
import { Container, SectionHeading } from "@/components/ui/layout";
import {
  getCompanionProduct,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/data/products";
import { productThemeStyle } from "@/lib/product-theme";
import { isSupabaseConfigured, siteConfig } from "@/lib/env";
import { formatDate } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const image = product.images[0]?.path;
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url: `${siteConfig.url}/products/${product.slug}`,
      images: image ? [{ url: image, alt: product.images[0]?.alt ?? product.name }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, companion] = await Promise.all([
    getRelatedProducts(product, 3),
    getCompanionProduct(product),
  ]);
  const image = product.images[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.sku,
    image: image ? `${siteConfig.url}${image.path}` : undefined,
    brand: { "@type": "Brand", name: "SilkSoul" },
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: product.price,
      availability:
        product.availableStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/products/${product.slug}`,
    },
    ...(product.rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating.average,
            reviewCount: product.rating.count,
          },
        }
      : {}),
  };

  return (
    <div className="pb-24" style={productThemeStyle(product.theme)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="pt-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <Link href="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <Link href="/products" className="hover:text-ink">Shop</Link>
          {product.category ? (
            <>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-ink">
                {product.category.name}
              </Link>
            </>
          ) : null}
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <ProductGallery images={product.images} productName={product.name} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {product.category ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {product.category.name}
                </p>
              ) : null}
              {product.isFeatured ? <Badge tone="accent">Bestseller</Badge> : null}
            </div>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <Link href="#reviews" className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                <StarRating rating={product.rating} />
              </Link>
              <span className="text-xs text-muted">{product.sku}</span>
            </div>
            <p className="mt-5 text-base leading-relaxed text-muted">{product.shortDescription}</p>

            <div className="mt-6 border-y border-border py-5">
              <Price
                amount={product.price}
                compareAt={product.compareAtPrice}
                currency={product.currency}
                size="lg"
              />
              <p className="mt-1 text-xs text-muted">
                Inclusive of all taxes · {product.availableStock > 0 ? "Ready to ship" : "Currently unavailable"}
              </p>
            </div>

            <div className="mt-6">
              <ProductPurchase product={product} />
            </div>

            {companion ? <CompanionSpotlight product={companion} /> : null}

            <div className="mt-8">
              <div className="mb-4 grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: Leaf, label: "Botanical" },
                  { icon: ShieldCheck, label: "Gentle care" },
                  { icon: Package, label: "Secure packing" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[12px] border border-border bg-surface px-2 py-3">
                    <item.icon className="mx-auto h-4 w-4 text-primary" aria-hidden="true" />
                    <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-muted">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <Accordion title="Key benefits" defaultOpen>
                <ul className="space-y-2">
                  {product.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Accordion>
              <Accordion title="Ingredients">
                <ul className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient) => (
                    <li
                      key={ingredient}
                      className="rounded-full border border-border bg-surface-soft px-3 py-1 text-xs text-ink"
                    >
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </Accordion>
              <Accordion title="How to use">
                <p>{product.usageInstructions}</p>
              </Accordion>
              <Accordion title="Specifications">
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {product.specifications.map((specification) => (
                    <div key={specification.label} className="border-b border-border/60 pb-2 last:border-0">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                        {specification.label}
                      </dt>
                      <dd className="mt-0.5 text-sm text-ink">{specification.value}</dd>
                    </div>
                  ))}
                </dl>
              </Accordion>
            </div>
          </div>
        </div>
      </Container>

      <section className="mt-20 border-y border-border bg-surface py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading eyebrow="The details" title="What makes it different." />
              <p className="mt-5 text-sm leading-relaxed text-muted">{product.description}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {product.benefits.slice(0, 4).map((benefit) => (
                  <div key={benefit} className="flex gap-2.5 rounded-[12px] border border-border bg-background p-3.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    <span className="text-sm text-ink">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[22px] border border-border bg-surface-soft">
              {image ? (
                <Image
                  src={image.path}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-contain p-6"
                />
              ) : null}
              <div className="absolute bottom-5 left-5 right-5 rounded-[14px] border border-border bg-surface/95 p-4 backdrop-blur">
                <p className="flex items-center gap-2 text-xs font-semibold text-ink">
                  <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
                  {product.specifications[0]?.value ?? "Made with care"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {product.usageInstructions}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="reviews" className="scroll-mt-24 py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <SectionHeading eyebrow="Reviews" title="What our customers say." />
              <div className="mt-6 rounded-[18px] border border-border bg-surface p-6">
                <div className="flex items-end gap-3">
                  <span className="font-serif text-5xl leading-none text-ink">
                    {product.rating.count > 0 ? product.rating.average.toFixed(1) : "—"}
                  </span>
                  <div className="pb-1">
                    <StarRating rating={product.rating} showCount={false} />
                    <p className="mt-1 text-xs text-muted">
                      {product.rating.count} approved {product.rating.count === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  Every review is moderated before it appears. We only show a verified
                  purchase label when a review can be matched to a completed order.
                </p>
              </div>

              {isSupabaseConfigured() ? (
                <div className="mt-6">
                  <ReviewForm productId={product.id} />
                </div>
              ) : (
                <div className="mt-6 rounded-[18px] border border-dashed border-border bg-surface-soft/50 p-6 text-sm text-muted">
                  Review submission is enabled once the store is connected to Supabase.
                </div>
              )}
            </div>

            <div>
              {product.reviews.length > 0 ? (
                <ul className="space-y-4">
                  {product.reviews.map((review) => (
                    <li key={review.id} className="rounded-[16px] border border-border bg-surface p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft text-xs font-semibold text-primary">
                            {review.displayName.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-ink">{review.displayName}</p>
                            <p className="text-[11px] text-muted">{formatDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {review.isVerifiedPurchase ? <Badge tone="success">Verified purchase</Badge> : null}
                          <StarRating rating={{ average: review.rating, count: 1 }} showCount={false} />
                        </div>
                      </div>
                      {review.title ? (
                        <h3 className="mt-4 text-sm font-semibold text-ink">{review.title}</h3>
                      ) : null}
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{review.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-[18px] border border-dashed border-border bg-surface-soft/40 p-8 text-center">
                  <StarRating rating={{ average: 0, count: 0 }} showCount={false} />
                  <h3 className="mt-4 font-serif text-2xl text-ink">No approved reviews yet</h3>
                  <p className="mt-2 max-w-xs text-sm text-muted">
                    Be the first to share your experience. Reviews appear here after moderation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-border bg-surface-soft/40 py-20">
          <Container>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Complete the ritual"
                title={related.length === 1 ? "Explore our other product" : "You may also like"}
                description="Designed to be used together, but lovely on their own."
              />
              <Link href="/products" className="text-sm font-semibold text-primary hover:text-primary-hover">
                View all products
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </div>
  );
}
