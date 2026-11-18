import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Droplets, Leaf, Sparkles } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/layout";
import { buttonVariants } from "@/components/ui/button";
import { getStoreSettings } from "@/lib/data/products";
import { siteImageSrc, type SiteImageKey } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "SilkSoul is a considered haircare brand built around gentle botanical oils, milky extracts and a quieter daily ritual.",
};

const mindset = [
  {
    icon: Droplets,
    title: "Small by choice",
    copy: "We would rather make two essentials properly than twenty things quickly. A focused collection means every formula has room to be considered, tested and refined.",
  },
  {
    icon: Leaf,
    title: "Botanical by nature",
    copy: "Rosemary, fenugreek, argan, castor and milky extracts are not added for decoration. Each ingredient is chosen for a clear job: condition, soften, smooth or cleanse.",
  },
  {
    icon: Sparkles,
    title: "Soft by design",
    copy: "Haircare should feel as good as it looks. We care about how an oil spreads, how a shampoo rinses and how your hair feels long after the bottle is back on the shelf.",
  },
];

const products = [
  {
    step: "01 · The oil",
    name: "Natural Hair Oil",
    copy: "A slow botanical blend of rosemary, fenugreek, argan and castor oils. It conditions the scalp, softens the lengths and leaves a quiet shine without a heavy film.",
    href: "/products/natural-hair-oil",
    imageKey: "aboutHeroOil",
    alt: "SILK Soul Natural Hair Oil",
    action: "Discover the oil",
  },
  {
    step: "02 · The cleanse",
    name: "Milky Repair & Smooth Shampoo",
    copy: "A sulphate-free cleanse with milky extracts. It lifts away buildup while keeping hair soft, smooth and comfortable, so the ritual ends feeling clean rather than stripped.",
    href: "/products/milky-repair-smooth-shampoo",
    imageKey: "aboutHeroShampoo",
    alt: "SILK Soul Milky Repair & Smooth Shampoo",
    action: "Discover the shampoo",
  },
] satisfies {
  step: string;
  name: string;
  copy: string;
  href: string;
  imageKey: SiteImageKey;
  alt: string;
  action: string;
}[];

export default async function AboutPage() {
  const settings = await getStoreSettings();

  return (
    <div className="pb-24">
      <section className="relative overflow-hidden border-b border-border bg-surface py-16 sm:py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Our story
              </p>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
                A quieter way to care for your hair.
              </h1>
              <div className="mt-5 max-w-lg space-y-4 text-base leading-relaxed text-muted">
                <p>
                  SilkSoul was created around a simple belief: the best haircare is not
                  the loudest. It is the bottle you reach for again because it fits your
                  routine, feels good in your hands and leaves your hair settled.
                </p>
                <p>
                  We make a small collection of essentials rather than a crowded shelf.
                  Our formulas pair botanical oils with milky extracts, and every product
                  is designed to play a clear part in the same ritual.
                </p>
              </div>
              <Link
                href="/products"
                className={`${buttonVariants({ size: "md" })} mt-7`}
              >
                Explore the collection
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="product-stage relative aspect-[3/4] overflow-hidden rounded-[24px] border border-border/80 shadow-[0_18px_45px_-38px_rgba(31,45,35,0.45)] ring-1 ring-white/70">
                  <Image
                    src={siteImageSrc(settings.images.aboutHeroOil)}
                    alt="SILK Soul Natural Hair Oil"
                    fill
                    sizes="(max-width: 1024px) 45vw, 250px"
                    className="object-contain p-3"
                  />
                </div>
                <div className="product-stage relative mt-10 aspect-[3/4] overflow-hidden rounded-[24px] border border-border/80 shadow-[0_18px_45px_-38px_rgba(31,45,35,0.45)] ring-1 ring-white/70">
                  <Image
                    src={siteImageSrc(settings.images.aboutHeroShampoo)}
                    alt="SILK Soul Milky Repair & Smooth Shampoo"
                    fill
                    sizes="(max-width: 1024px) 45vw, 250px"
                    className="object-contain p-3"
                  />
                </div>
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-accent/30 bg-background px-5 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-accent-ink shadow-sm">
                Two essentials. One ritual.
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <SectionHeading
            eyebrow="The SilkSoul mindset"
            title="Quiet by design. Intentional by habit."
            description="We are not trying to fill a shelf. We are trying to earn a place in your routine by making the experience feel calm, considered and worth repeating."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {mindset.map((item, index) => (
              <div
                key={item.title}
                className={cn(
                  "rounded-[18px] border border-border bg-surface p-6",
                  index === mindset.length - 1 && "sm:col-span-2",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-primary">
                    <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="font-serif text-3xl text-accent/35" aria-hidden="true">
                    0{index + 1}
                  </span>
                </div>
                <h2 className="mt-4 font-serif text-2xl text-ink">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <section className="border-y border-border bg-surface py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="What we make"
            title="Two essentials, each with a clear job."
            description="The oil and the shampoo are designed as a pair. One slows you down and conditions; the other cleanses gently and leaves hair ready to start again."
            align="center"
          />

          <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
            {products.map((product) => (
              <article
                key={product.name}
                className="group overflow-hidden rounded-[24px] border border-border/80 bg-background shadow-[0_22px_55px_-45px_rgba(31,45,35,0.45)] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_30px_65px_-42px_rgba(31,45,35,0.5)]"
              >
                <div className="product-stage relative aspect-[4/3.7] border-b border-border/60">
                  <Image
                    src={siteImageSrc(settings.images[product.imageKey])}
                    alt={product.alt}
                    fill
                    sizes="(max-width: 768px) 90vw, 460px"
                    className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <span className="absolute left-4 top-4 rounded-full border border-border/80 bg-surface/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary backdrop-blur">
                    {product.step}
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="font-serif text-2xl text-ink">{product.name}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{product.copy}</p>
                  <Link
                    href={product.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    {product.action}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center font-serif text-lg italic leading-relaxed text-ink">
            “Use the oil first. Wash with the shampoo. Repeat when your hair asks for it.”
          </p>
        </Container>
      </section>

      <Container className="pt-16 sm:pt-20">
        <div className="overflow-hidden rounded-[26px] border border-border bg-primary px-7 py-14 text-center text-white sm:px-12">
          <h2 className="mx-auto max-w-xl font-serif text-3xl leading-tight sm:text-4xl">
            Let nature love your hair.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70">
            Explore the SilkSoul collection and build a ritual that fits your week.
          </p>
          <Link
            href="/products"
            className={`${buttonVariants({ variant: "secondary" })} mt-6 bg-white text-ink hover:bg-white/90`}
          >
            Shop the collection
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
