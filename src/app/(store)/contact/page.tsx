import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/layout";
import { buttonVariants } from "@/components/ui/button";
import { getStoreSettings } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Reach the SilkSoul team for product questions, orders and delivery support.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();

  return (
    <div className="pb-24 pt-12 sm:pt-16">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Contact</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl">
              We are happy to help.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              Questions about a product, your order or the right routine for your hair?
              Send us a message and the SilkSoul team will get back to you.
            </p>

            <div className="mt-8 space-y-3">
              <a
                href={`mailto:${settings.supportEmail}`}
                className="flex items-center gap-4 rounded-[16px] border border-border bg-surface p-5 transition-colors hover:border-primary/30"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-primary">
                  <Mail className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-[0.14em] text-muted">Email</span>
                  <span className="mt-0.5 block text-sm font-medium text-ink">{settings.supportEmail}</span>
                </span>
              </a>
              <a
                href={`tel:${settings.supportPhone.replace(/\s/g, "")}`}
                className="flex items-center gap-4 rounded-[16px] border border-border bg-surface p-5 transition-colors hover:border-primary/30"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-primary">
                  <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-[0.14em] text-muted">Phone / WhatsApp</span>
                  <span className="mt-0.5 block text-sm font-medium text-ink">{settings.supportPhone}</span>
                </span>
              </a>
              <div className="flex items-center gap-4 rounded-[16px] border border-border bg-surface p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-primary">
                  <Clock className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-[0.14em] text-muted">Response</span>
                  <span className="mt-0.5 block text-sm font-medium text-ink">
                    We reply as soon as we can, usually within a business day.
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`mailto:${settings.supportEmail}`} className={buttonVariants({ size: "md" })}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email us
              </a>
              <a
                href={`tel:${settings.supportPhone.replace(/\s/g, "")}`}
                className={buttonVariants({ variant: "outline", size: "md" })}
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Call us
              </a>
            </div>
          </div>

          <div className="rounded-[22px] border border-border bg-surface-soft/60 p-7 sm:p-9">
            <h2 className="font-serif text-2xl text-ink">Before you write</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              These quick links may answer your question faster.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { href: "/faq", title: "Product and routine FAQ", copy: "How to use the oil and shampoo together." },
                { href: "/track-order", title: "Track an order", copy: "Check the latest delivery status." },
                { href: "/policies/shipping", title: "Shipping and delivery", copy: "Coverage, timing and charges." },
                { href: "/policies/returns", title: "Returns and damaged items", copy: "What to do if something is wrong." },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-start justify-between gap-4 rounded-[14px] border border-border bg-surface p-4 transition-colors hover:border-primary/30"
                  >
                    <span>
                      <span className="block text-sm font-medium text-ink group-hover:text-primary">{item.title}</span>
                      <span className="mt-0.5 block text-xs text-muted">{item.copy}</span>
                    </span>
                    <span className="text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-2 border-t border-border pt-5 text-xs text-muted">
              <AtSign className="h-4 w-4" aria-hidden="true" />
              Follow @silksoul_official for product updates.
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
