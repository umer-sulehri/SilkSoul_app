import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { getStoreSettings } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Returns policy",
  description: "How to request a return, replacement or resolution for a SilkSoul order.",
};

export default async function ReturnsPolicyPage() {
  const settings = await getStoreSettings();
  return (
    <LegalPage
      title="Returns policy"
      intro="We want you to feel confident trying SilkSoul. If something is not right, contact us and we will work through it with you."
      updated="November 2026"
      sections={[
        {
          heading: "Damaged or incorrect items",
          body: [
            `If your order arrives damaged, leaking or different from what you ordered, contact ${settings.supportEmail} as soon as possible with your order reference and a photo of the item and packaging. We will review it and agree on a replacement, refund or other resolution.`,
          ],
        },
        {
          heading: "Change of mind",
          body: [
            "For hygiene reasons, opened haircare products cannot be returned unless they are faulty or the wrong item was sent. Unopened products may be considered for return within seven days of delivery, provided the packaging is intact and the request is approved in advance.",
            "Return delivery charges may apply for change-of-mind returns. This does not affect your rights where a product is faulty or not as described.",
          ],
        },
        {
          heading: "How to start a return",
          body: [
            `Contact us with your order reference, the reason for the request and any supporting photos. Please wait for our team to approve the return before sending anything back.`,
            "Once an approved return is received and inspected, we will confirm the resolution. Refunds or adjustments for cash-on-delivery orders will be arranged through an agreed method.",
          ],
        },
        {
          heading: "Cancellations",
          body: [
            "If you need to cancel an order, contact us as soon as possible. We can usually cancel before dispatch. Once an order is with the courier, the return process may apply instead.",
          ],
        },
        {
          heading: "Contact",
          body: [
            `Questions about a return can be sent to ${settings.supportEmail} or ${settings.supportPhone}. Please include your order reference so we can help quickly.`,
          ],
        },
      ]}
    />
  );
}
