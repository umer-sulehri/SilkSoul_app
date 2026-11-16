import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus, Search, ShoppingBag } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/layout";
import { listAdminQuotations } from "@/lib/data/admin";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Quotations" };

const statuses = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

export default async function AdminQuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const quotations = await listAdminQuotations({ status: params.status, search: params.q });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Business documents"
        title="Quotations"
        description="Prepare priced proposals, send them to customers and convert accepted quotes into orders."
        action={
          <Link
            href="/admin/quotations/new"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New quotation
          </Link>
        }
      />

      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
        {statuses.map((status) => {
          const active = (params.status ?? "") === status.value;
          const href = status.value
            ? `/admin/quotations?status=${status.value}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`
            : `/admin/quotations${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`;
          return (
            <Link
              key={status.value || "all"}
              href={href}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary/25 bg-primary/10 text-primary"
                  : "border-border bg-surface text-muted hover:text-ink",
              )}
            >
              {status.label}
            </Link>
          );
        })}
      </div>

      <form method="get" className="flex max-w-xl items-center gap-2">
        {params.status ? <input type="hidden" name="status" value={params.status} /> : null}
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <Input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Quotation number, name or phone"
            className="pl-9"
            aria-label="Search quotations"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {quotations.length === 0 ? (
        <EmptyState
          title="No quotations found"
          description={
            params.q || params.status
              ? "Try clearing the filters or searching a different reference."
              : "Create a quotation for a customer who wants a priced proposal."
          }
          icon={<FileText className="h-7 w-7" aria-hidden="true" />}
        />
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
                  <th className="px-5 py-3 font-medium">Quotation</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Lines</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Valid until</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">View</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quotation) => (
                  <tr key={quotation.id} className="border-b border-border/70 last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/quotations/${quotation.id}`}
                        className="font-medium text-ink hover:text-primary"
                      >
                        {quotation.quotation_number}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatDate(quotation.created_at)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{quotation.customer_name}</p>
                      <p className="text-xs text-muted">{quotation.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {quotation.quotation_items?.[0]?.count ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {formatCurrency(Number(quotation.grand_total), quotation.currency)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {formatDate(quotation.validity_date)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={quotation.status} />
                        {quotation.converted_order_id ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                            <ShoppingBag className="h-3 w-3" aria-hidden="true" />
                            Converted
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/quotations/${quotation.id}`}
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
