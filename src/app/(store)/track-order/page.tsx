import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/checkout/track-order-form";
import { Container } from "@/components/ui/layout";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the latest status of your SilkSoul order with your reference and phone number.",
};

export default function TrackOrderPage() {
  return (
    <div className="pb-24 pt-12 sm:pt-16">
      <Container>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Track order</p>
        <h1 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">Where is my parcel?</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Use the private details from your confirmation to see the latest status. We never
          expose order details through guessable links.
        </p>
        <div className="mt-10">
          <TrackOrderForm />
        </div>
      </Container>
    </div>
  );
}
