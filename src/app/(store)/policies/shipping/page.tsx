import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { getStoreSettings } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Shipping policy",
  description: "SilkSoul delivery coverage, charges, cash on delivery and order tracking.",
};

export default async function ShippingPolicyPage() {
  const settings = await getStoreSettings();
  return (
    <LegalPage
      title="Shipping policy"
      intro="We deliver SilkSoul orders across Pakistan. Delivery charges and any free-delivery threshold are shown at checkout before you place an order."
      updated="November 2026"
      sections={[
        {
          heading: "Delivery coverage and charges",
          body: [
            `Standard delivery is charged at ${settings.currency} ${settings.deliveryFee.toLocaleString("en-PK")} unless your order qualifies for free delivery. Orders of ${settings.currency} ${settings.freeDeliveryThreshold.toLocaleString("en-PK")} or more receive free standard delivery.`,
            "The final delivery fee is recalculated on the server when your order is created, so the amount shown on your confirmation is the amount that applies.",
          ],
        },
        {
          heading: "Processing and dispatch",
          body: [
            "Orders are usually prepared within one to two business days after confirmation. During busy periods or public holidays there may be a short delay.",
            "We will contact you by phone if we need to confirm your address or availability before dispatch.",
          ],
        },
        {
          heading: "Cash on delivery",
          body: [
            "Where cash on delivery is enabled, you pay the courier when your parcel arrives. Please keep the correct amount ready. A cash-on-delivery order is not treated as paid until the courier has collected payment.",
          ],
        },
        {
          heading: "Tracking your order",
          body: [
            "You can check the status of your order using the Track order page with your order reference and the phone number used at checkout. For privacy, orders cannot be looked up using guessable links.",
          ],
        },
        {
          heading: "Undeliverable orders",
          body: [
            `If an order cannot be delivered because the address or phone number is incorrect, or repeated delivery attempts fail, the parcel may be returned to us. Contact ${settings.supportEmail} if you need to correct delivery details.`,
          ],
        },
      ]}
    />
  );
}
