"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, Truck, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { siteImageSrc } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@/types/catalog";

const navItems = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "Our story" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ settings }: { settings: StoreSettings }) {
  const pathname = usePathname();
  const { itemCount, isHydrated } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Close the mobile drawer when navigation completes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="border-b border-primary-hover/40 bg-[linear-gradient(90deg,var(--color-primary-hover),var(--color-primary)_48%,var(--color-primary-hover))] text-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-2 px-5 py-2 text-center text-[11px] font-medium tracking-[0.08em] sm:text-xs">
          <Truck className="h-3.5 w-3.5 shrink-0 text-accent-light" aria-hidden="true" />
          <span>{settings.announcement ?? "Cash on delivery available across Pakistan"}</span>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-ink transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-navigation"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="SilkSoul home"
            >
              <span className="relative h-10 w-10 overflow-hidden rounded-full border border-accent/40 bg-surface-soft shadow-sm">
                <Image
                  src={siteImageSrc(settings.images.logo)}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </span>
              <span className="font-serif text-[26px] leading-none tracking-tight text-ink">
                SilkSoul
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-1 py-2 text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    active && "text-ink",
                  )}
                >
                  {item.label}
                  {active ? (
                    <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent" aria-hidden="true" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/products"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-ink transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Search products"
            >
              <Search className="h-[19px] w-[19px]" aria-hidden="true" />
            </Link>
            <Link
              href="/track-order"
              className="hidden items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:inline-flex"
            >
              Track order
            </Link>
            <Link
              href="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-ink transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label={
                isHydrated && itemCount > 0
                  ? `Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`
                  : "Cart"
              }
            >
              <ShoppingBag className="h-[19px] w-[19px]" aria-hidden="true" />
              {isHydrated && itemCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-ink tabular-nums">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <div
            id="mobile-navigation"
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-background p-6 shadow-xl animate-soft-fade"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif text-2xl">SilkSoul</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[10px] px-3 py-3 text-base font-medium text-ink transition-colors hover:bg-surface-soft"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/track-order"
                className="rounded-[10px] px-3 py-3 text-base font-medium text-ink transition-colors hover:bg-surface-soft"
              >
                Track order
              </Link>
              <Link
                href="/cart"
                className="rounded-[10px] px-3 py-3 text-base font-medium text-ink transition-colors hover:bg-surface-soft"
              >
                Cart{isHydrated && itemCount > 0 ? ` (${itemCount})` : ""}
              </Link>
            </nav>
            <div className="mt-auto border-t border-border pt-6 text-sm text-muted">
              <p className="font-medium text-ink">Need help?</p>
              <a href={`mailto:${settings.supportEmail}`} className="mt-1 block hover:text-ink">
                {settings.supportEmail}
              </a>
              <a href={`tel:${settings.supportPhone.replace(/\s/g, "")}`} className="mt-1 block hover:text-ink">
                {settings.supportPhone}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
