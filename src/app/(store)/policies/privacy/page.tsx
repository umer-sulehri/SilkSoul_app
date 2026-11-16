import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { getStoreSettings } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How SilkSoul collects, uses and protects customer information.",
};

export default async function PrivacyPolicyPage() {
  const settings = await getStoreSettings();
  return (
    <LegalPage
      title="Privacy policy"
      intro="This policy explains what information we collect when you use the SilkSoul store and how we use it to fulfil your order."
      updated="November 2026"
      sections={[
        {
          heading: "Information we collect",
          body: [
            "When you place an order we collect your name, phone number, optional email address, delivery address, city, optional postal code and any order note you choose to share. We also keep a record of the products you ordered and the amounts charged.",
            "We do not collect or store payment card details. Cash on delivery is currently the available payment method, and any future card payments would be handled by a compliant payment provider.",
          ],
        },
        {
          heading: "How we use your information",
          body: [
            "We use your details to confirm and deliver your order, answer support questions, process returns and keep accurate business records. We may contact you by phone or email about an order you placed.",
            "We do not sell your personal information. We only share the details needed by delivery and service providers to complete your order, or where required by law.",
          ],
        },
        {
          heading: "Storage and security",
          body: [
            "The store uses Supabase for its database, authentication and file storage. Access to customer and order records is restricted by row-level security policies and trusted server-side operations.",
            "Product images may be served publicly. Order, quotation and receipt documents are kept private and are only accessible to authorised staff or through a secure customer link.",
          ],
        },
        {
          heading: "Cookies and local storage",
          body: [
            "The storefront uses browser storage to remember your shopping bag and may use cookies to maintain an authenticated admin session. These are used to run the store, not for advertising profiles.",
          ],
        },
        {
          heading: "Your choices",
          body: [
            "You can contact us to ask about the personal information we hold about you, or to request a correction or deletion where we are not required to keep it for accounting or legal reasons.",
            `For privacy questions, contact ${settings.supportEmail}.`,
          ],
        },
      ]}
    />
  );
}
