import type { Metadata } from "next";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/layout";
import { listAdminReceipts } from "@/lib/data/admin";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Receipts" };

export default async function AdminReceiptsPage() {
  const receipts = await listAdminReceipts();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Business documents"
        title="Receipts"
        description="Generated payment receipts. Each receipt snapshots the order payment status at the time it was issued."
      />

      {receipts.length === 0 ? (
        <EmptyState
          title="No receipts yet"
          description="Open an order and choose Generate receipt to create the first document."
          icon={<ReceiptText className="h-7 w-7" aria-hidden="true" />}
        />
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
                  <th className="px-5 py-3 font-medium">Receipt</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Issued</th>
                  <th className="px-5 py-3 text-right font-medium">View</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="border-b border-border/70 last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/receipts/${receipt.id}`}
                        className="font-medium text-ink hover:text-primary"
                      >
                        {receipt.receipt_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {receipt.order ? (
                        <Link
                          href={`/admin/orders/${receipt.order.id}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {receipt.order.order_number}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink">
                      {receipt.order?.customer_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {formatCurrency(Number(receipt.amount))}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={receipt.payment_status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {formatDateTime(receipt.issued_at)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/receipts/${receipt.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
