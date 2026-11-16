import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { Container } from "@/components/ui/layout";
import { getStoreSettings } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review your SilkSoul selection before checkout.",
};

export default async function CartPage() {
  const settings = await getStoreSettings();

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Your bag</p>
        <h1 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">Almost ritual time.</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Check your quantities and we will confirm availability when you place the order.
        </p>
        <div className="mt-10">
          <CartView
            deliveryFee={settings.deliveryFee}
            freeThreshold={settings.freeDeliveryThreshold}
            currency={settings.currency}
          />
        </div>
      </Container>
    </div>
  );
}
