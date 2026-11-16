import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  ReceiptText,
  StickyNote,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import {
  OrderNoteForm,
  OrderStatusForm,
  PaymentStatusForm,
} from "@/components/admin/order-forms";
import { GenerateReceiptForm } from "@/components/admin/document-forms";
import { StatusBadge } from "@/components/ui/badge";
import { getAdminOrder } from "@/lib/data/admin";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Order detail" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const items = order.order_items ?? [];
  const history = order.order_status_history ?? [];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Orders
      </Link>

      <AdminPageHeader
        eyebrow="Order"
        title={order.order_number}
        description={`Placed ${formatDateTime(order.placed_at)} · ${order.payment_method.replaceAll("_", " ").toUpperCase()}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.payment_status} />
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-[16px] border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-serif text-xl text-ink">Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
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
                      <td className="px-4 py-3 text-xs text-muted">{item.product_sku ?? "—"}</td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatCurrency(Number(item.unit_price), order.currency)}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{item.quantity}</td>
                      <td className="px-5 py-3 text-right font-medium tabular-nums">
                        {formatCurrency(Number(item.line_total), order.currency)}
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
                  {formatCurrency(Number(order.subtotal), order.currency)}
                </dd>
              </div>
              {Number(order.discount_total) > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">
                    Discount {order.coupon_code ? `(${order.coupon_code})` : ""}
                  </dt>
                  <dd className="tabular-nums text-success">
                    −{formatCurrency(Number(order.discount_total), order.currency)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Delivery</dt>
                <dd className="tabular-nums">
                  {Number(order.delivery_fee) === 0
                    ? "Free"
                    : formatCurrency(Number(order.delivery_fee), order.currency)}
                </dd>
              </div>
              {Number(order.tax_total) > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Tax</dt>
                  <dd className="tabular-nums">
                    {formatCurrency(Number(order.tax_total), order.currency)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 border-t border-border pt-2 text-base">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="font-semibold tabular-nums text-ink">
                  {formatCurrency(Number(order.grand_total), order.currency)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[16px] border border-border bg-surface p-5 sm:p-6">
            <h2 className="font-serif text-xl text-ink">Timeline</h2>
            {history.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No status history recorded.</p>
            ) : (
              <ol className="mt-4 space-y-4">
                {history.map((entry) => (
                  <li key={entry.id} className="relative border-l border-border pl-4">
                    <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium capitalize text-ink">
                        {entry.to_status.replaceAll("_", " ")}
                      </p>
                      <span className="text-xs text-muted">
                        {formatDateTime(entry.created_at)}
                      </span>
                    </div>
                    {entry.note ? (
                      <p className="mt-1 text-xs text-muted">{entry.note}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-[16px] border border-border bg-surface p-5 sm:p-6">
            <h2 className="font-serif text-xl text-ink">Internal note</h2>
            <p className="mb-4 mt-1 text-sm text-muted">Only staff can see this note.</p>
            <OrderNoteForm orderId={order.id} note={order.admin_note} />
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-[16px] border border-border bg-surface p-5">
            <h2 className="font-serif text-lg text-ink">Customer</h2>
            <p className="mt-3 font-medium text-ink">{order.customer_name}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={`tel:${order.customer_phone}`} className="hover:text-ink">
                  {order.customer_phone}
                </a>
              </li>
              {order.customer_email ? (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <a href={`mailto:${order.customer_email}`} className="break-all hover:text-ink">
                    {order.customer_email}
                  </a>
                </li>
              ) : null}
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {order.delivery_address}
                  <br />
                  {order.city}
                  {order.postal_code ? ` ${order.postal_code}` : ""}
                </span>
              </li>
            </ul>
            {order.customer_note ? (
              <div className="mt-4 rounded-[10px] bg-surface-soft p-3 text-sm">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  <StickyNote className="h-3.5 w-3.5" aria-hidden="true" />
                  Customer note
                </p>
                <p className="mt-1.5 text-ink">{order.customer_note}</p>
              </div>
            ) : null}
          </section>

          <section className="rounded-[16px] border border-border bg-surface p-5">
            <h2 className="font-serif text-lg text-ink">Fulfilment</h2>
            <div className="mt-4">
              <OrderStatusForm orderId={order.id} status={order.status} />
            </div>
          </section>

          <section className="rounded-[16px] border border-border bg-surface p-5">
            <h2 className="font-serif text-lg text-ink">Payment</h2>
            <p className="mb-4 mt-1 text-xs text-muted">
              {order.payment_method === "cod"
                ? "Cash on delivery. Mark paid once cash is collected."
                : `Method: ${order.payment_method.replaceAll("_", " ")}`}
            </p>
            <PaymentStatusForm orderId={order.id} paymentStatus={order.payment_status} />
          </section>

          <section className="rounded-[16px] border border-border bg-surface p-5">
            <h2 className="flex items-center gap-2 font-serif text-lg text-ink">
              <ReceiptText className="h-4 w-4 text-primary" aria-hidden="true" />
              Receipts
            </h2>
            {order.receipts && order.receipts.length > 0 ? (
              <ul className="mt-3 divide-y divide-border/70">
                {order.receipts.map((receipt) => (
                  <li key={receipt.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/receipts/${receipt.id}`}
                        className="block truncate font-mono text-xs font-medium text-ink hover:text-primary"
                      >
                        {receipt.receipt_number}
                      </Link>
                      <p className="text-[11px] text-muted">
                        {formatDateTime(receipt.issued_at)}
                      </p>
                    </div>
                    <Link
                      href={`/admin/receipts/${receipt.id}`}
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Open
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted">No receipt generated for this order yet.</p>
            )}
            <div className="mt-4 border-t border-border pt-4">
              <GenerateReceiptForm
                orderId={order.id}
                paymentStatus={order.payment_status}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
