import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink, TriangleAlert } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { getAdminOrder, getAdminReceipt } from "@/lib/data/admin";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Receipt detail" };

export default async function AdminReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = await getAdminReceipt(id);
  if (!receipt) notFound();

  const order = await getAdminOrder(receipt.order_id);
  const unpaid = receipt.payment_status !== "paid";

  return (
    <div className="space-y-6">
      <Link
        href="/admin/receipts"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Receipts
      </Link>

      <AdminPageHeader
        eyebrow="Receipt"
        title={receipt.receipt_number}
        description={`Issued ${formatDateTime(receipt.issued_at)} · ${formatCurrency(Number(receipt.amount))}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={receipt.payment_status} />
            <Link
              href={`/admin/receipts/${receipt.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-border bg-surface px-3 text-xs font-medium text-ink hover:border-primary/30"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Open PDF
            </Link>
            <Link
              href={`/admin/receipts/${receipt.id}/pdf?download=1`}
              className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-primary px-3 text-xs font-medium text-white hover:bg-primary-hover"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download
            </Link>
          </div>
        }
      />

      {unpaid ? (
        <p className="flex items-start gap-2 rounded-[10px] border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-ink">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          This receipt is marked <strong>unpaid</strong>. A cash-on-delivery receipt must not be
          treated as proof of payment until the payment status changes.
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-[16px] border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-serif text-xl text-ink">PDF preview</h2>
            <p className="text-xs text-muted">Rendered on demand from the saved receipt record.</p>
          </div>
          <iframe
            src={`/admin/receipts/${receipt.id}/pdf`}
            title={`Receipt ${receipt.receipt_number}`}
            className="h-[78vh] w-full bg-surface-soft"
          />
        </section>

        <div className="space-y-5">
          <section className="rounded-[16px] border border-border bg-surface p-5">
            <h2 className="font-serif text-lg text-ink">Document</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Receipt</dt>
                <dd className="font-mono text-xs text-ink">{receipt.receipt_number}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Order</dt>
                <dd>
                  {receipt.order ? (
                    <Link
                      href={`/admin/orders/${receipt.order.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {receipt.order.order_number}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Amount</dt>
                <dd className="tabular-nums text-ink">
                  {formatCurrency(Number(receipt.amount))}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Method</dt>
                <dd className="capitalize text-ink">
                  {receipt.payment_method.replaceAll("_", " ")}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Issued</dt>
                <dd className="text-xs text-ink">{formatDateTime(receipt.issued_at)}</dd>
              </div>
            </dl>
          </section>

          {order ? (
            <section className="rounded-[16px] border border-border bg-surface p-5">
              <h2 className="font-serif text-lg text-ink">Order snapshot</h2>
              <p className="mt-3 text-sm font-medium text-ink">{order.customer_name}</p>
              <p className="text-xs text-muted">{order.customer_phone}</p>
              <p className="mt-1 text-xs text-muted">
                {order.delivery_address}
                <br />
                {order.city}
                {order.postal_code ? ` ${order.postal_code}` : ""}
              </p>
              <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="tabular-nums">
                    {formatCurrency(Number(order.subtotal), order.currency)}
                  </dd>
                </div>
                {Number(order.discount_total) > 0 ? (
                  <div className="flex justify-between">
                    <dt className="text-muted">Discount</dt>
                    <dd className="tabular-nums">
                      -{formatCurrency(Number(order.discount_total), order.currency)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery</dt>
                  <dd className="tabular-nums">
                    {Number(order.delivery_fee) === 0
                      ? "Free"
                      : formatCurrency(Number(order.delivery_fee), order.currency)}
                  </dd>
                </div>
                {Number(order.tax_total) > 0 ? (
                  <div className="flex justify-between">
                    <dt className="text-muted">Tax</dt>
                    <dd className="tabular-nums">
                      {formatCurrency(Number(order.tax_total), order.currency)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold text-ink">
                  <dt>Total</dt>
                  <dd className="tabular-nums">
                    {formatCurrency(Number(order.grand_total), order.currency)}
                  </dd>
                </div>
              </dl>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
