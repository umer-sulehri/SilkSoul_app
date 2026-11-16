import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/layout";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "SilkSoul is a considered haircare brand built around gentle botanical oils and milky extracts.",
};

export default function AboutPage() {
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
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
                SilkSoul was built around a simple belief: haircare should feel calm,
                considered and worth looking forward to. We make a small collection of
                essentials, each designed to do one job beautifully.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-border bg-surface-soft">
              <Image
                src="/images/product-2-milky-shampoo.jpeg"
                alt="SILK Soul Milky Repair & Smooth Shampoo"
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-contain p-6"
              />
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <SectionHeading
            eyebrow="What we believe"
            title="Fewer products. Better rituals."
            description="We would rather make two things properly than twenty things quickly. That means focused formulas, honest descriptions and a routine you can actually keep."
          />
          <div className="space-y-8">
            {[
              {
                icon: Leaf,
                title: "Nature, with intention",
                copy: "Rosemary, coconut, almond, castor, argan, mustard and fenugreek oils sit at the heart of our hair oil. Our shampoo pairs milky extracts with a sulphate-free cleanse.",
              },
              {
                icon: Sparkles,
                title: "Texture matters",
                copy: "A product can be nourishing and still feel light. We care about how it spreads, how it rinses and how your hair feels afterwards.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[18px] border border-border bg-surface p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-primary">
                  <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-serif text-2xl text-ink">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <Container>
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
