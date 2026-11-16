import type { Metadata } from "next";
import Link from "next/link";
import { Search, Warehouse } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/layout";
import { listInventory } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Inventory" };

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const products = await listInventory(params.q);

  const outOfStock = products.filter(
    (product) => product.stock_on_hand - product.stock_reserved <= 0,
  ).length;
  const lowStock = products.filter((product) => {
    const available = product.stock_on_hand - product.stock_reserved;
    return available > 0 && available <= product.low_stock_threshold;
  }).length;
  const totalUnits = products.reduce((total, product) => total + product.stock_on_hand, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Inventory"
        description="Stock changes are recorded with a reason and an audit trail."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[14px] border border-border bg-surface px-4 py-3">
          <p className="text-xs uppercase tracking-[0.1em] text-muted">On hand</p>
          <p className="mt-1 font-serif text-2xl text-ink">{totalUnits}</p>
        </div>
        <div className="rounded-[14px] border border-warning/30 bg-warning/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.1em] text-muted">Low stock</p>
          <p className="mt-1 font-serif text-2xl text-warning">{lowStock}</p>
        </div>
        <div className="rounded-[14px] border border-danger/25 bg-danger/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.1em] text-muted">Out of stock</p>
          <p className="mt-1 font-serif text-2xl text-danger">{outOfStock}</p>
        </div>
      </div>

      <form method="get" className="flex max-w-xl items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <Input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search product or SKU"
            className="pl-9"
            aria-label="Search inventory"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
        {params.q ? (
          <Link href="/admin/inventory" className="text-xs text-muted hover:text-ink">
            Clear
          </Link>
        ) : null}
      </form>

      {products.length === 0 ? (
        <EmptyState
          title={params.q ? "No stock matches that search" : "No active products"}
          description="Create a product before managing its inventory."
          icon={<Warehouse className="h-7 w-7" aria-hidden="true" />}
        />
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">On hand</th>
                  <th className="px-4 py-3 font-medium">Reserved</th>
                  <th className="px-4 py-3 font-medium">Available</th>
                  <th className="px-4 py-3 font-medium">Alert at</th>
                  <th className="px-4 py-3 font-medium">State</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const available = product.stock_on_hand - product.stock_reserved;
                  const state =
                    available <= 0
                      ? { label: "Out of stock", tone: "danger" as const }
                      : available <= product.low_stock_threshold
                        ? { label: "Low stock", tone: "warning" as const }
                        : { label: "Healthy", tone: "success" as const };
                  return (
                    <tr key={product.id} className="border-b border-border/70 last:border-0">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/inventory/${product.id}`}
                          className="font-medium text-ink hover:text-primary"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs text-muted">
                          {product.sku} · {product.category?.name ?? "Uncategorised"}
                        </p>
                      </td>
                      <td className="px-4 py-3 tabular-nums">{product.stock_on_hand}</td>
                      <td className="px-4 py-3 tabular-nums">{product.stock_reserved}</td>
                      <td className="px-4 py-3 font-medium tabular-nums">{available}</td>
                      <td className="px-4 py-3 tabular-nums text-muted">
                        {product.low_stock_threshold}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={state.tone}>{state.label}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/inventory/${product.id}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Adjust
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
