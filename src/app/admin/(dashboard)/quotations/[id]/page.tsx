import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  ShoppingBag,
  StickyNote,
  TriangleAlert,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import {
  ConvertQuotationForm,
  QuotationStatusForm,
} from "@/components/admin/document-forms";
import { StatusBadge } from "@/components/ui/badge";
import { getAdminQuotation } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Quotation detail" };

export default async function AdminQuotationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const quotation = await getAdminQuotation(id);
  if (!quotation) notFound();

  const items = quotation.quotation_items ?? [];
  const expired =
    quotation.validity_date !== null &&
    new Date(`${quotation.validity_date}T23:59:59`) < new Date() &&
    !quotation.converted_order_id;

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
        eyebrow="Quotation"
        title={quotation.quotation_number}
        description={`Created ${formatDate(quotation.created_at)} · Valid until ${formatDate(quotation.validity_date)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={quotation.status} />
            {quotation.converted_order ? (
              <Link
                href={`/admin/orders/${quotation.converted_order.id}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-border bg-surface px-3 text-xs font-medium text-primary hover:border-primary/30"
              >
                <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                {quotation.converted_order.order_number}
              </Link>
            ) : null}
            <Link
              href={`/admin/quotations/${quotation.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-border bg-surface px-3 text-xs font-medium text-ink hover:border-primary/30"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Preview PDF
            </Link>
            <Link
              href={`/admin/quotations/${quotation.id}/pdf?download=1`}
              className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-primary px-3 text-xs font-medium text-white hover:bg-primary-hover"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download
            </Link>
          </div>
        }
      />

      {error ? (
        <p className="rounded-[10px] border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-ink">
          {decodeURIComponent(error)}
        </p>
      ) : null}

      {expired ? (
        <p className="flex items-start gap-2 rounded-[10px] border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-ink">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          This quotation is past its validity date. Update it before sharing or converting.
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-[16px] border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-serif text-xl text-ink">Quoted items</h2>
              <p className="text-xs text-muted">{items.length} line items</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-border/70 last:border-0">
                      <td className="px-5 py-3">
                        {item.product_id ? (
                          <Link
                            href={`/admin/products/${item.product_id}/edit`}
                            className="font-medium text-ink hover:text-primary"
                          >
                            {item.product_name}
                          </Link>
                        ) : (
                          <span className="font-medium text-ink">{item.product_name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatCurrency(Number(item.unit_price), quotation.currency)}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{item.quantity}</td>
                      <td className="px-5 py-3 text-right font-medium tabular-nums">
                        {formatCurrency(Number(item.line_total), quotation.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="ml-auto max-w-sm space-y-2 border-t border-border px-5 py-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">
                  {formatCurrency(Number(quotation.subtotal), quotation.currency)}
                </dd>
              </div>
              {Number(quotation.discount_total) > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Discount</dt>
                  <dd className="tabular-nums text-success">
                    -{formatCurrency(Number(quotation.discount_total), quotation.currency)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Delivery</dt>
                <dd className="tabular-nums">
                  {Number(quotation.delivery_fee) === 0
                    ? "Free"
                    : formatCurrency(Number(quotation.delivery_fee), quotation.currency)}
                </dd>
              </div>
              {Number(quotation.tax_total) > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Tax</dt>
                  <dd className="tabular-nums">
                    {formatCurrency(Number(quotation.tax_total), quotation.currency)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 border-t border-border pt-2 text-base">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="font-semibold tabular-nums text-ink">
                  {formatCurrency(Number(quotation.grand_total), quotation.currency)}
                </dd>
              </div>
            </dl>
          </section>

          {quotation.notes ? (
            <section className="rounded-[16px] border border-border bg-surface p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-serif text-xl text-ink">
                <StickyNote className="h-4 w-4 text-primary" aria-hidden="true" />
                Notes
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
                {quotation.notes}
              </p>
            </section>
          ) : null}

          <p className="text-xs leading-relaxed text-muted">
            A quotation is a priced proposal, not an order or proof of payment. Converting an
            accepted quotation rechecks product availability, reserves stock and creates a COD
            order.
          </p>
        </div>

        <div className="space-y-5">
          <section className="rounded-[16px] border border-border bg-surface p-5">
            <h2 className="font-serif text-lg text-ink">Customer</h2>
            <p className="mt-3 font-medium text-ink">{quotation.customer_name}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={`tel:${quotation.customer_phone}`} className="hover:text-ink">
                  {quotation.customer_phone}
                </a>
              </li>
              {quotation.customer_email ? (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${quotation.customer_email}`}
                    className="break-all hover:text-ink"
                  >
                    {quotation.customer_email}
                  </a>
                </li>
              ) : null}
              {quotation.customer_address ? (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {quotation.customer_address}
                    {quotation.customer_city ? (
                      <>
                        <br />
                        {quotation.customer_city}
                        {quotation.customer_postal_code
                          ? ` ${quotation.customer_postal_code}`
                          : ""}
                      </>
                    ) : null}
                  </span>
                </li>
              ) : null}
            </ul>
          </section>

          <section className="rounded-[16px] border border-border bg-surface p-5">
            <h2 className="font-serif text-lg text-ink">Status</h2>
            <div className="mt-4">
              <QuotationStatusForm quotationId={quotation.id} status={quotation.status} />
            </div>
          </section>

          {quotation.status === "accepted" && !quotation.converted_order_id ? (
            <section className="rounded-[16px] border border-primary/25 bg-primary/5 p-5">
              <h2 className="font-serif text-lg text-ink">Convert to order</h2>
              <p className="mb-4 mt-1 text-xs text-muted">
                Stock is checked and reserved. The order starts as pending COD.
              </p>
              <ConvertQuotationForm quotationId={quotation.id} />
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
