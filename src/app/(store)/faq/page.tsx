import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/layout";
import { Accordion } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { getStoreSettings } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Answers about SILK Soul hair oil and milky shampoo, delivery, cash on delivery and order tracking.",
};

const faqs = [
  {
    question: "How do I use the Natural Hair Oil?",
    answer:
      "Apply a suitable amount to the scalp and hair, massage gently with your fingertips, and distribute evenly through the lengths. Leave it on for 1–2 hours or as directed, then wash thoroughly with shampoo.",
  },
  {
    question: "How often should I oil my hair?",
    answer:
      "Most people enjoy an oil ritual once or twice a week. You can adjust based on your hair type, scalp comfort and how much conditioning your hair needs.",
  },
  {
    question: "Is the Milky Shampoo sulphate free?",
    answer:
      "Yes. The Milky Repair & Smooth Shampoo is labelled sulphate free and is enriched with natural milky extracts. It is designed to gently cleanse while leaving hair soft and manageable.",
  },
  {
    question: "Can I use both products together?",
    answer:
      "Yes. They are designed as a pair: use the oil as a pre-wash treatment, then cleanse with the milky shampoo. The shampoo can also be used on its own for regular washing.",
  },
  {
    question: "Are the products suitable for all hair types?",
    answer:
      "The packaging describes both products as suitable for all hair types. If you have a sensitive scalp or a known allergy, patch test first and check the ingredient list before use.",
  },
  {
    question: "Do you offer cash on delivery?",
    answer:
      "Cash on delivery is available across Pakistan when enabled in the store settings. The checkout page shows the currently available payment method before you place an order.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Use the Track order page with your order reference and the phone number you used at checkout. For privacy, we do not expose orders through guessable links.",
  },
  {
    question: "What if my order arrives damaged?",
    answer:
      "Contact us with your order reference and a photo of the item as soon as possible. We will review it and agree on a replacement or resolution. Please see the returns policy for details.",
  },
];

export default async function FaqPage() {
  const settings = await getStoreSettings();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-border bg-surface py-16 sm:py-20">
        <Container size="narrow" className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">FAQ</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl">
            Good questions, simple answers.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted">
            Everything you need to know about the formulas, the ritual and getting your order
            to your door.
          </p>
        </Container>
      </section>

      <Container size="narrow" className="pt-12">
        <div className="rounded-[18px] border border-border bg-surface px-6">
          {faqs.map((faq, index) => (
            <Accordion key={faq.question} title={faq.question} defaultOpen={index === 0}>
              {faq.answer}
            </Accordion>
          ))}
        </div>

        <div className="mt-10 rounded-[20px] border border-border bg-surface-soft/60 p-7 text-center">
          <h2 className="font-serif text-2xl text-ink">Still unsure?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Send us a message and we will help you choose the right routine.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact" className={buttonVariants({ size: "md" })}>Contact us</Link>
            <a href={`mailto:${settings.supportEmail}`} className={buttonVariants({ variant: "outline", size: "md" })}>
              Email the team
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}
