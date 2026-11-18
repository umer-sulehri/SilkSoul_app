import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Droplets,
  FlaskConical,
  Leaf,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { HeroProductFlipper } from "@/components/storefront/hero-product-flipper";
import { MobileHeroSlider } from "@/components/storefront/mobile-hero-slider";
import { MobileProductList } from "@/components/storefront/mobile-product-list";
import { ProductCard } from "@/components/product/product-card";
import { Container, SectionHeading } from "@/components/ui/layout";
import { buttonVariants } from "@/components/ui/button";
import { getFeaturedProducts, listProducts } from "@/lib/data/products";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/env";

export const metadata = {
  title: "SilkSoul — Let nature love your hair",
  description: siteConfig.description,
};

const values = [
  { icon: Leaf, title: "Botanical first", copy: "Seven oils, chosen for how they work together." },
  { icon: FlaskConical, title: "Sulphate free", copy: "A gentler cleanse that respects your scalp." },
  { icon: ShieldCheck, title: "Made with care", copy: "Small-batch haircare with nothing unnecessary." },
  { icon: Truck, title: "Cash on delivery", copy: "Delivered across Pakistan, pay when it arrives." },
];

const ingredients = [
  {
    name: "Rosemary & fenugreek",
    note: "The roots",
    copy: "Traditional botanicals that help hair feel conditioned, strong and cared for.",
  },
  {
    name: "Argan & castor",
    note: "The shine",
    copy: "Rich, lightweight oils that smooth the hair surface and add a natural glow.",
  },
  {
    name: "Milky extracts",
    note: "The softness",
    copy: "A gentle, sulphate-free cleanse that leaves hair soft, smooth and manageable.",
  },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts(4);
  const mobileProducts = await listProducts();

  return (
    <>
      <div className="hidden sm:block">
        <HeroProductFlipper products={featured} />
      </div>
      <MobileHeroSlider products={featured} />

      <section className="border-y border-border/80 bg-surface">
        <Container className="grid grid-cols-2 gap-2 py-4 sm:grid-cols-2 sm:py-5 lg:grid-cols-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="flex items-start gap-3 rounded-[16px] px-3 py-3 transition-colors hover:bg-surface-soft/60"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/10">
                <value.icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{value.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{value.copy}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      <section id="featured-products" className="scroll-mt-24 py-14 sm:py-24">
        <Container>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="The collection"
              title="Two essentials. One quiet ritual."
              description="A hair oil and a milky shampoo designed to work alongside each other. Every formula is made from the outside in, with ingredients your hair recognises."
            />
            <Link
              href="/products"
              className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
            >
              Shop all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2 lg:gap-6">
              {featured.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index === 0} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[18px] border border-dashed border-border bg-surface-soft/40 px-6 py-16 text-center text-sm text-muted">
              The collection is being prepared. Please check back shortly.
            </div>
          )}
        </Container>
      </section>

      <section className="bg-surface py-14 sm:py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="product-stage relative aspect-[3/4] overflow-hidden rounded-[26px] border border-border/80 shadow-[0_18px_45px_-38px_rgba(31,45,35,0.45)] ring-1 ring-white/70">
                  <Image
                    src="/images/product-1-hair-oil.jpeg"
                    alt="SILK Soul Natural Hair Oil"
                    fill
                    sizes="(max-width: 1024px) 45vw, 260px"
                    className="object-contain p-3"
                  />
                </div>
                <div className="product-stage relative mt-10 aspect-[3/4] overflow-hidden rounded-[26px] border border-border/80 shadow-[0_18px_45px_-38px_rgba(31,45,35,0.45)] ring-1 ring-white/70">
                  <Image
                    src="/images/product-2-milky-shampoo.jpeg"
                    alt="SILK Soul Milky Repair & Smooth Shampoo"
                    fill
                    sizes="(max-width: 1024px) 45vw, 260px"
                    className="object-contain p-3"
                  />
                </div>
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-accent/30 bg-background px-5 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-accent-ink shadow-sm">
                Made for everyday softness
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <SectionHeading
                eyebrow="Our approach"
                title="Two steps, written as one ritual."
                description="SilkSoul is not a shelf of shortcuts. It is a two-part story: an oil that slows you down, and a wash that leaves hair soft. Each product has its own role. Together, they make the ritual."
              />

              <p className="mt-6 border-l-2 border-accent/50 pl-4 font-serif text-lg italic leading-relaxed text-ink">
                “One bottle softens. One bottle cleanses. Neither feels complete without
                the other.”
              </p>

              <ol className="mt-8 space-y-0 border-l border-border">
                {[
                  {
                    eyebrow: "Chapter one · Natural Hair Oil",
                    title: "Begin at the scalp.",
                    copy: "Warm a few drops of our botanical hair oil between your palms. Massage it into the scalp and lengths, then let rosemary, fenugreek, argan and castor oil do their quiet work. It is the slow, unhurried half of the ritual.",
                    href: "/products/natural-hair-oil",
                  },
                  {
                    eyebrow: "Chapter two · Milky Repair & Smooth Shampoo",
                    title: "Then, wash it clean.",
                    copy: "The next morning, our milky sulphate-free shampoo lifts away buildup without stripping the softness the oil left behind. Hair feels clean, comfortable and ready to begin again.",
                    href: "/products/milky-repair-smooth-shampoo",
                  },
                  {
                    eyebrow: "The ritual · Together",
                    title: "The pair is the point.",
                    copy: "The oil conditions. The shampoo refreshes. Used together, they turn an ordinary wash day into a small ritual you can actually keep.",
                    href: "/products",
                  },
                ].map((item) => (
                  <li key={item.title} className="relative pb-7 pl-6 last:pb-0">
                    <span
                      className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-accent"
                      aria-hidden="true"
                    />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                      {item.eyebrow}
                    </p>
                    <h3 className="mt-1.5 font-serif text-xl text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.copy}</p>
                    <Link
                      href={item.href}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover"
                    >
                      Explore this step
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ol>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
              >
                Read the full SilkSoul story
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Inside the bottle"
            title="Ingredients with a reason to be there."
            description="Nothing added for decoration. Each botanical has a job — condition, smooth, soften or shine."
            align="center"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ingredients.map((ingredient, index) => (
              <div
                key={ingredient.name}
                className="group relative overflow-hidden rounded-[22px] border border-border/80 bg-surface p-7 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_26px_55px_-42px_rgba(31,45,35,0.5)]"
              >
                <Leaf
                  className="pointer-events-none absolute -right-4 -top-3 h-24 w-24 rotate-12 text-primary/[0.06] transition-transform duration-500 group-hover:rotate-6"
                  strokeWidth={1}
                  aria-hidden="true"
                />
                <span className="font-serif text-5xl text-accent/35" aria-hidden="true">
                  0{index + 1}
                </span>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {ingredient.note}
                </p>
                <h3 className="mt-2 font-serif text-2xl text-ink">{ingredient.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{ingredient.copy}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-14 sm:pb-24">
        <Container>
          <div className="botanical-panel relative overflow-hidden rounded-[30px] border border-primary-hover/60 bg-primary text-white shadow-[0_35px_90px_-52px_rgba(31,45,35,0.75)]">
            <Leaf
              className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rotate-12 text-white/[0.05]"
              strokeWidth={1}
              aria-hidden="true"
            />
            <div className="relative grid gap-10 px-7 py-12 sm:px-12 sm:py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                  <span className="h-px w-5 bg-accent-light" aria-hidden="true" />
                  The SilkSoul ritual
                </p>
                <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                  Oil, cleanse, repeat.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
                  A simple weekly rhythm: let the oil do its quiet work, then wash it away
                  with a gentle milky lather. Consistency is the entire secret.
                </p>
                <Link
                  href="/products"
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "lg" }),
                    "mt-7 bg-accent-light text-ink hover:bg-white",
                  )}
                >
                  Start your ritual
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <ol className="space-y-6">
                {[
                  { step: "01", title: "Massage", copy: "Warm a few drops of oil and work it into the scalp." },
                  { step: "02", title: "Rest", copy: "Leave it on for an hour, or longer if your hair needs it." },
                  { step: "03", title: "Cleanse", copy: "Wash with the milky shampoo and rinse thoroughly." },
                ].map((item) => (
                  <li key={item.step} className="flex gap-5 border-b border-white/15 pb-5 last:border-0 last:pb-0">
                    <span className="font-serif text-2xl text-accent-light">{item.step}</span>
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm text-white/70">{item.copy}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-16 sm:pb-24">
        <Container>
          <div className="herbal-wash relative flex flex-col items-center overflow-hidden rounded-[28px] border border-border/80 bg-surface px-6 py-14 text-center shadow-[0_28px_65px_-50px_rgba(31,45,35,0.5)] sm:px-10">
            <Leaf
              className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 -rotate-12 text-primary/[0.05]"
              strokeWidth={1}
              aria-hidden="true"
            />
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent-ink ring-1 ring-accent/25">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 max-w-xl font-serif text-3xl leading-tight text-ink sm:text-4xl">
              Your hair already knows what it likes.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              Give it something gentle. Explore the collection and find the ritual that
              fits your routine.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/products/natural-hair-oil" className={buttonVariants({ size: "md" })}>
                <Droplets className="h-4 w-4" aria-hidden="true" />
                Shop hair oil
              </Link>
              <Link
                href="/products/milky-repair-smooth-shampoo"
                className={buttonVariants({ variant: "outline", size: "md" })}
              >
                Shop shampoo
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <MobileProductList products={mobileProducts} />
    </>
  );
}
