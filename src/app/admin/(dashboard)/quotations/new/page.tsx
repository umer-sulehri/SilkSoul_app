import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { QuotationForm } from "@/components/admin/quotation-form";
import { getAdminStoreSettings, listAdminProducts } from "@/lib/data/admin";

export const metadata: Metadata = { title: "New quotation" };

export default async function NewQuotationPage() {
  const [products, settings] = await Promise.all([
    listAdminProducts(),
    getAdminStoreSettings(),
  ]);

  const options = products
    .filter((product) => product.is_active && !product.archived_at)
    .map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: Number(product.price),
      currency: product.currency,
    }));

  // Server-rendered default; the client can edit the date before submitting.
  // eslint-disable-next-line react-hooks/purity
  const validity = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/quotations"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Quotations
      </Link>

      <AdminPageHeader
        eyebrow="New document"
        title="Create quotation"
        description="Price a proposal for a customer. Stock is not reserved until the quotation is accepted and converted."
      />

      {options.length === 0 ? (
        <div className="rounded-[14px] border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          <p className="font-semibold text-ink">No active products</p>
          <p className="mt-1 text-muted">
            Add or activate a product before creating a quotation.
          </p>
        </div>
      ) : (
        <QuotationForm
          products={options}
          defaultDeliveryFee={Number(settings?.delivery_fee ?? 250)}
          defaultValidity={validity}
        />
      )}
    </div>
  );
}
