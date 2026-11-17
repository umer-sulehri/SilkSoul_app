import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmButton } from "@/components/admin/confirm-button";
import {
  CouponForm,
  StoreSettingsForm,
} from "@/components/admin/settings-forms";
import {
  deleteCouponAction,
  toggleCouponAction,
} from "@/app/admin/actions/settings";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminStoreSettings, listCoupons } from "@/lib/data/admin";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Store settings" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [settings, coupons] = await Promise.all([getAdminStoreSettings(), listCoupons()]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Store settings"
        description="Store details, full website colours and discount codes."
      />

      {!settings ? (
        <div className="rounded-[14px] border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          <p className="font-semibold text-ink">Settings row missing</p>
          <p className="mt-1 text-muted">
            Run <code className="rounded bg-surface px-1 py-0.5 text-xs">supabase/seed.sql</code>{" "}
            to create the store settings row, then reload this page.
          </p>
        </div>
      ) : (
        <section className="rounded-[16px] border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-5 font-serif text-xl text-ink">Store details</h2>
          <StoreSettingsForm settings={settings} />
        </section>
      )}

      <section className="rounded-[16px] border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-serif text-xl text-ink">Create a discount code</h2>
        <p className="mb-5 mt-1 text-sm text-muted">
          Codes are validated again on the server when an order is placed.
        </p>
        <CouponForm />
      </section>

      <section className="overflow-hidden rounded-[16px] border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-serif text-xl text-ink">Discount codes</h2>
          <p className="text-xs text-muted">{coupons.length} total</p>
        </div>

        {coupons.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">No discount codes created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Discount</th>
                  <th className="px-4 py-3 font-medium">Minimum</th>
                  <th className="px-4 py-3 font-medium">Window</th>
                  <th className="px-4 py-3 font-medium">Limit</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-border/70 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-mono text-xs font-semibold text-ink">{coupon.code}</p>
                      {coupon.description ? (
                        <p className="mt-0.5 text-xs text-muted">{coupon.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.discount_type === "percentage"
                        ? `${Number(coupon.discount_value)}%`
                        : formatCurrency(Number(coupon.discount_value))}
                      {coupon.max_discount ? (
                        <span className="block text-[11px] text-muted">
                          max {formatCurrency(Number(coupon.max_discount))}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatCurrency(Number(coupon.min_subtotal))}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {coupon.starts_at ? formatDateTime(coupon.starts_at) : "Any time"}
                      <span className="block">
                        {coupon.ends_at ? `to ${formatDateTime(coupon.ends_at)}` : "No expiry"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {coupon.usage_limit ?? "Unlimited"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={coupon.is_active ? "success" : "neutral"}>
                        {coupon.is_active ? "Active" : "Paused"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <form action={toggleCouponAction}>
                          <input type="hidden" name="couponId" value={coupon.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={coupon.is_active ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className="text-xs text-primary underline-offset-2 hover:underline"
                          >
                            {coupon.is_active ? "Pause" : "Activate"}
                          </button>
                        </form>
                        <form action={deleteCouponAction}>
                          <input type="hidden" name="couponId" value={coupon.id} />
                          <ConfirmButton message={`Delete ${coupon.code}?`}>
                            Delete
                          </ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
