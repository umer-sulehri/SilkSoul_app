import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Search } from "lucide-react";
import { OrderStatusQuickForm } from "@/components/admin/order-forms";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/layout";
import { listAdminOrders } from "@/lib/data/admin";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

const statuses = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const orders = await listAdminOrders({ status: params.status, search: params.q });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Fulfilment"
        title="Orders"
        description="Review, confirm and fulfil cash-on-delivery orders. Status changes update stock."
      />

      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
        {statuses.map((status) => {
          const active = (params.status ?? "") === status.value;
          const href = status.value
            ? `/admin/orders?status=${status.value}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`
            : `/admin/orders${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`;
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
            placeholder="Order number, name or phone"
            className="pl-9"
            aria-label="Search orders"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={
            params.q || params.status
              ? "Try clearing the filters or searching a different reference."
              : "New orders will appear here as soon as customers check out."
          }
          icon={<ClipboardList className="h-7 w-7" aria-hidden="true" />}
        />
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Placed</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">View</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/70 last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-ink hover:text-primary"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                      {formatDateTime(order.placed_at)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{order.customer_name}</p>
                      <p className="text-xs text-muted">
                        {order.city} · {order.customer_phone}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {order.order_items?.[0]?.count ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {formatCurrency(Number(order.grand_total), order.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.payment_status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        <StatusBadge status={order.status} />
                        <OrderStatusQuickForm
                          key={order.status}
                          orderId={order.id}
                          orderNumber={order.order_number}
                          status={order.status}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
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
