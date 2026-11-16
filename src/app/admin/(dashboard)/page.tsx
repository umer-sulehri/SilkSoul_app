import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  Bell,
  ClipboardList,
  Package,
  Star,
  TriangleAlert,
} from "lucide-react";
import { AdminPageHeader, DemoNotice } from "@/components/admin/page-header";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/layout";
import { markNotificationReadAction } from "@/app/admin/actions/orders";
import { getDashboardData } from "@/lib/data/admin";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata = { title: "Overview" };

function StatCard({
  label,
  value,
  hint,
  icon,
  href,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="h-full rounded-[16px] border border-border bg-surface p-5 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-soft text-primary">
          {icon}
        </span>
      </div>
      <p className="mt-4 font-serif text-3xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function AdminOverviewPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Store overview" />
        <DemoNotice />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Overview"
        title="Store overview"
        description="A live read on orders, stock and customer feedback."
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center rounded-[10px] bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Add product
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Delivered revenue"
          value={formatCurrency(data.revenue)}
          hint="Cash-on-delivery orders marked delivered"
          icon={<Banknote className="h-4 w-4" aria-hidden="true" />}
          href="/admin/orders?status=delivered"
        />
        <StatCard
          label="Orders"
          value={String(data.orderCount)}
          hint="All orders placed"
          icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}
          href="/admin/orders"
        />
        <StatCard
          label="Needs action"
          value={String(data.activeOrders)}
          hint="Pending, confirmed or processing"
          icon={<Package className="h-4 w-4" aria-hidden="true" />}
          href="/admin/orders?status=pending"
        />
        <StatCard
          label="Reviews to moderate"
          value={String(data.pendingReviews)}
          hint="Waiting for approval"
          icon={<Star className="h-4 w-4" aria-hidden="true" />}
          href="/admin/reviews?status=pending"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <section className="rounded-[18px] border border-border bg-surface xl:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="font-serif text-xl text-ink">Recent orders</h2>
              <p className="text-xs text-muted">Newest first</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              All orders <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="No orders yet"
                description="Orders placed on the storefront will appear here."
                icon={<ClipboardList className="h-7 w-7" aria-hidden="true" />}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Placed</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/70 last:border-0">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-ink hover:text-primary"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-ink">{order.customer_name}</p>
                        <p className="text-xs text-muted">{order.city}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {formatDateTime(order.placed_at)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-ink">
                        {formatCurrency(Number(order.grand_total), order.currency)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-5">
          <section className="rounded-[18px] border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-warning" aria-hidden="true" />
                <h2 className="font-serif text-lg text-ink">Low stock</h2>
              </div>
              <Badge tone={data.lowStock.length > 0 ? "warning" : "success"}>
                {data.lowStock.length}
              </Badge>
            </div>
            {data.lowStock.length === 0 ? (
              <p className="px-5 py-5 text-sm text-muted">
                Every active product is above its low-stock threshold.
              </p>
            ) : (
              <ul className="divide-y divide-border/70">
                {data.lowStock.slice(0, 5).map((product) => {
                  const available = product.stock_on_hand - product.stock_reserved;
                  return (
                    <li key={product.id}>
                      <Link
                        href={`/admin/inventory/${product.id}`}
                        className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-soft/60"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink">
                            {product.name}
                          </span>
                          <span className="text-xs text-muted">
                            {available} available · {product.stock_reserved} reserved
                          </span>
                        </span>
                        <Badge tone={available <= 0 ? "danger" : "warning"}>
                          {available <= 0 ? "Out" : "Low"}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="border-t border-border px-5 py-3">
              <Link
                href="/admin/inventory"
                className="text-xs font-medium text-primary hover:underline"
              >
                Open inventory
              </Link>
            </div>
          </section>

          <section className="rounded-[18px] border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="font-serif text-lg text-ink">Notifications</h2>
            </div>
            {data.notifications.length === 0 ? (
              <p className="px-5 py-5 text-sm text-muted">You are all caught up.</p>
            ) : (
              <ul className="divide-y divide-border/70">
                {data.notifications.map((notification) => (
                  <li key={notification.id} className="flex items-start gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{notification.title}</p>
                      {notification.body ? (
                        <p className="mt-0.5 text-xs text-muted">{notification.body}</p>
                      ) : null}
                      {notification.link ? (
                        <Link
                          href={notification.link}
                          className="mt-1 inline-block text-xs text-primary hover:underline"
                        >
                          Open
                        </Link>
                      ) : null}
                    </div>
                    <form action={markNotificationReadAction}>
                      <input type="hidden" name="notificationId" value={notification.id} />
                      <button
                        type="submit"
                        className="text-[11px] text-muted underline-offset-2 hover:text-ink hover:underline"
                      >
                        Dismiss
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/admin/products"
          className="rounded-[14px] border border-border bg-surface px-4 py-3 text-sm hover:border-primary/30"
        >
          <span className="font-medium text-ink">Catalog</span>
          <span className="mt-0.5 block text-xs text-muted">
            {data.productCount} products · manage details and images
          </span>
        </Link>
        <Link
          href="/admin/orders?status=pending"
          className="rounded-[14px] border border-border bg-surface px-4 py-3 text-sm hover:border-primary/30"
        >
          <span className="font-medium text-ink">Fulfilment</span>
          <span className="mt-0.5 block text-xs text-muted">
            {data.activeOrders} orders need attention
          </span>
        </Link>
        <Link
          href="/admin/reviews?status=pending"
          className="rounded-[14px] border border-border bg-surface px-4 py-3 text-sm hover:border-primary/30"
        >
          <span className="font-medium text-ink">Reviews</span>
          <span className="mt-0.5 block text-xs text-muted">
            {data.pendingReviews} awaiting moderation
          </span>
        </Link>
      </div>
    </div>
  );
}
