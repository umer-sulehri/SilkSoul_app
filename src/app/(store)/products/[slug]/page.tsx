import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Droplets,
  FlaskConical,
  Leaf,
  Package,
  ShieldCheck,
  Sparkles,
  Sprout,
} from "lucide-react";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import {
  ProductSwitcherRail,
  ProductSwitcherStrip,
} from "@/components/product/product-switcher";
import { ReviewForm } from "@/components/reviews/review-form";
import { Price, StarRating } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { Accordion } from "@/components/ui/accordion";
import { Container, SectionHeading } from "@/components/ui/layout";
import { getProductBySlug, listProducts } from "@/lib/data/products";
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

  const allProducts = await listProducts();
  const collection = (allProducts.length > 0 ? allProducts : [product]).sort((a, b) => {
    if (a.id === product.id) return -1;
    if (b.id === product.id) return 1;
    return 0;
  });
  const currentIndex = Math.max(
    0,
    collection.findIndex((item) => item.id === product.id),
  );
  const image = product.images[0];
  const size = product.specifications.find((entry) => entry.label.toLowerCase() === "size");
  const formula = product.specifications.find((entry) =>
    ["formula", "key botanicals", "key ingredient"].includes(entry.label.toLowerCase()),
  );

  const journey = [
    {
      icon: Sprout,
      step: "01",
      eyebrow: "Origins",
      title: "Botanical beginnings",
      body:
        product.ingredients.length > 0
          ? `Built around ${product.ingredients.slice(0, 3).join(", ").toLowerCase()}, chosen for their gentle, nourishing character.`
          : product.shortDescription,
    },
    {
      icon: FlaskConical,
      step: "02",
      eyebrow: "Formulation",
      title: "Blended with intention",
      body: product.shortDescription,
    },
    {
      icon: Droplets,
      step: "03",
      eyebrow: "Ritual",
      title: "A moment for you",
      body: product.usageInstructions,
    },
    {
      icon: Sparkles,
      step: "04",
      eyebrow: "The finish",
      title: "How it leaves your hair",
      body:
        product.benefits.slice(0, 3).join(" · ") ||
        "A simple, considered finish that fits naturally into your week.",
    },
  ];

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
    <div className="product-page-shell pb-24" style={productThemeStyle(product.theme)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="pt-6">
        <div className="flex items-center justify-between gap-4">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-muted"
          >
            <Link href="/" className="hover:text-ink">Home</Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link href="/products" className="hover:text-ink">Shop</Link>
            {product.category ? (
              <>
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="hover:text-ink"
                >
                  {product.category.name}
                </Link>
              </>
            ) : null}
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="text-ink">{product.name}</span>
          </nav>
          {collection.length > 1 ? (
            <span className="hidden shrink-0 rounded-full border border-border/80 bg-surface/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted backdrop-blur sm:inline-flex">
              Product 0{currentIndex + 1} of 0{collection.length}
            </span>
          ) : null}
        </div>

        <ProductSwitcherStrip
          products={collection}
          currentId={product.id}
          className="mt-7"
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 xl:grid-cols-[184px_minmax(0,1fr)_minmax(370px,0.92fr)] xl:gap-10">
          <ProductSwitcherRail products={collection} currentId={product.id} />

          <div>
            <ProductGallery images={product.images} productName={product.name} />
            <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
              {[
                { icon: Leaf, label: "Botanical" },
                { icon: ShieldCheck, label: "Gentle care" },
                { icon: Package, label: "Secure packing" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[12px] border border-border/80 bg-surface/65 px-2 py-3 backdrop-blur"
                >
                  <item.icon className="mx-auto h-4 w-4 text-primary" aria-hidden="true" />
                  <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-muted">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {product.category ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {product.category.name}
                </p>
              ) : null}
            </div>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <Link
                href="#reviews"
                className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <StarRating rating={product.rating} />
              </Link>
              <span className="text-xs text-muted">{product.sku}</span>
            </div>
            <p className="mt-5 text-base leading-relaxed text-muted">{product.shortDescription}</p>

            {(size || formula) ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {size ? (
                  <span className="rounded-full border border-border/80 bg-surface/75 px-3 py-1 text-[11px] font-medium text-ink">
                    {size.value.split("/")[0]?.trim()}
                  </span>
                ) : null}
                {formula ? (
                  <span className="rounded-full border border-border/80 bg-surface/75 px-3 py-1 text-[11px] font-medium text-ink">
                    {formula.value.split("/")[0]?.trim()}
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 border-y border-border/80 py-5">
              <Price
                amount={product.price}
                compareAt={product.compareAtPrice}
                currency={product.currency}
                size="lg"
              />
              <p className="mt-1 text-xs text-muted">
                Inclusive of all taxes ·{" "}
                {product.availableStock > 0 ? "Ready to ship" : "Currently unavailable"}
              </p>
            </div>

            <div className="mt-6">
              <ProductPurchase product={product} />
            </div>

            <div className="mt-7">
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
                    <div
                      key={specification.label}
                      className="border-b border-border/60 pb-2 last:border-0"
                    >
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

      <section className="mt-20 border-y border-border/70 bg-surface/80 py-16 backdrop-blur sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading eyebrow="The details" title="What makes it different." />
              <p className="mt-5 text-sm leading-relaxed text-muted">{product.description}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {product.benefits.slice(0, 4).map((benefit) => (
                  <div
                    key={benefit}
                    className="flex gap-2.5 rounded-[12px] border border-border bg-background/70 p-3.5"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    <span className="text-sm text-ink">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/products"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Shop the full collection
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
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
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted">
                  {product.usageInstructions}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(55% 70% at 8% 12%, color-mix(in srgb, var(--color-surface-soft) 92%, transparent), transparent 72%), radial-gradient(45% 55% at 94% 80%, color-mix(in srgb, var(--color-accent) 12%, transparent), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <Container className="relative">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="The product journey"
                title="From botanical origins to your finishing ritual."
                description={`Follow ${product.name} through the ingredients that shape it, the ritual it belongs to and the finish it leaves behind.`}
              />
              <div className="mt-7 rounded-[20px] border border-border/80 bg-surface/75 p-5 backdrop-blur">
                <div className="flex items-center gap-4">
                  <div className="product-stage relative h-20 w-20 shrink-0 overflow-hidden rounded-[14px] border border-border">
                    {image ? (
                      <Image
                        src={image.path}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                      The collection
                    </p>
                    <p className="mt-1 font-serif text-lg text-ink">{product.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {collection.length} considered {collection.length === 1 ? "essential" : "essentials"}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {product.ingredients.slice(0, 5).map((ingredient) => (
                    <span
                      key={ingredient}
                      className="rounded-full border border-border bg-background/70 px-2.5 py-1 text-[10px] text-muted"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <ol className="relative space-y-3">
              <span
                className="absolute bottom-8 left-[22px] top-8 w-px bg-gradient-to-b from-accent/70 via-primary/30 to-transparent"
                aria-hidden="true"
              />
              {journey.map((step) => (
                <li
                  key={step.step}
                  className="relative flex gap-4 rounded-[18px] border border-transparent p-3 transition-colors hover:border-border/80 hover:bg-surface/60"
                >
                  <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-surface text-primary shadow-[0_10px_30px_-20px_rgba(31,45,35,0.5)]">
                    <step.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold tracking-[0.16em] text-accent-ink">
                        {step.step}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                        {step.eyebrow}
                      </span>
                    </div>
                    <h3 className="mt-1 font-serif text-xl text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section id="reviews" className="scroll-mt-24 border-t border-border/70 py-20">
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
                      {product.rating.count} approved{" "}
                      {product.rating.count === 1 ? "review" : "reviews"}
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
                          {review.isVerifiedPurchase ? (
                            <Badge tone="success">Verified purchase</Badge>
                          ) : null}
                          <StarRating
                            rating={{ average: review.rating, count: 1 }}
                            showCount={false}
                          />
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
    </div>
  );
}
