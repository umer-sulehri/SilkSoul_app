import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Container } from "@/components/ui/layout";
import { getStoreSettings } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your SilkSoul order with cash on delivery.",
};

export default async function CheckoutPage() {
  const settings = await getStoreSettings();

  return (
    <div className="pb-24 pt-8 sm:pt-10">
      <Container>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted">
          <Link href="/cart" className="hover:text-ink">Bag</Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-ink">Checkout</span>
        </nav>
        <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Checkout</p>
            <h1 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">A few last details.</h1>
          </div>
          <p className="max-w-sm text-sm text-muted">
            Cash on delivery. We will confirm your order and delivery timeline by phone.
          </p>
        </div>
        <div className="mt-10">
          <CheckoutForm
            deliveryFee={settings.deliveryFee}
            freeThreshold={settings.freeDeliveryThreshold}
            codEnabled={settings.codEnabled}
          />
        </div>
      </Container>
    </div>
  );
}
