import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, AtSign, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/layout";
import type { StoreSettings } from "@/types/catalog";

const shopLinks = [
  { href: "/products", label: "All products" },
  { href: "/products/natural-hair-oil", label: "Natural Hair Oil" },
  { href: "/products/milky-repair-smooth-shampoo", label: "Milky Shampoo" },
  { href: "/track-order", label: "Track order" },
];

const brandLinks = [
  { href: "/about", label: "Our story" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const policyLinks = [
  { href: "/policies/privacy", label: "Privacy policy" },
  { href: "/policies/shipping", label: "Shipping policy" },
  { href: "/policies/returns", label: "Returns policy" },
];

export function SiteFooter({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="botanical-panel mt-24 border-t border-primary-hover/50 bg-primary text-white/70">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative h-9 w-9 overflow-hidden rounded-full border border-white/15 bg-white/10">
                <Image src="/images/logo.jpeg" alt="" fill sizes="36px" className="object-cover" />
              </span>
              <span className="font-serif text-2xl text-white">SilkSoul</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Botanical haircare made with patience. Gentle oils and milky extracts for
              hair that feels soft, strong and cared for.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                aria-label="SilkSoul on Instagram"
              >
                <AtSign className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={`mailto:${settings.supportEmail}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                aria-label="Email SilkSoul"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="Brand" links={brandLinks} />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Care</p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={`tel:${settings.supportPhone.replace(/\s/g, "")}`} className="hover:text-white">
                  {settings.supportPhone}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-white">
                  {settings.supportEmail}
                </a>
              </li>
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Delivering across Pakistan</span>
              </li>
            </ul>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-light hover:text-white"
            >
              Talk to us
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-white/15 pt-7 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SilkSoul. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {policyLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="tabular-nums">Prices shown in {settings.currency}</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white">{title}</p>
      <ul className="mt-4 space-y-3 text-sm text-white/70">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
