import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { InventoryAdjustmentForm } from "@/components/admin/inventory-adjustment-form";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/layout";
import { getInventoryDetail } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Adjust inventory" };

function movementLabel(type: string) {
  return type.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="text-muted">—</span>;
  return (
    <span className={value > 0 ? "font-medium text-success" : "font-medium text-danger"}>
      {value > 0 ? "+" : ""}
      {value}
    </span>
  );
}

export default async function InventoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getInventoryDetail(id);
  if (!data) notFound();

  const { product, movements } = data;
  const available = product.stock_on_hand - product.stock_reserved;
  const low = available <= product.low_stock_threshold;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inventory"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Inventory
      </Link>

      <AdminPageHeader
        eyebrow="Inventory"
        title={product.name}
        description={`${product.sku} · ${product.category?.name ?? "Uncategorised"}`}
        action={
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border px-4 text-sm font-medium text-ink hover:bg-surface-soft"
          >
            View product
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-[14px] border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted">On hand</p>
          <p className="mt-1 font-serif text-3xl text-ink">{product.stock_on_hand}</p>
        </div>
        <div className="rounded-[14px] border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted">Reserved</p>
          <p className="mt-1 font-serif text-3xl text-ink">{product.stock_reserved}</p>
        </div>
        <div className="rounded-[14px] border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted">Available</p>
          <p className="mt-1 font-serif text-3xl text-ink">{available}</p>
        </div>
        <div className="rounded-[14px] border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted">State</p>
          <div className="mt-2">
            <Badge tone={available <= 0 ? "danger" : low ? "warning" : "success"}>
              {available <= 0 ? "Out of stock" : low ? "Low stock" : "Healthy"}
            </Badge>
          </div>
          <p className="mt-2 text-xs text-muted">Alert at {product.low_stock_threshold}</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-[16px] border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-serif text-xl text-ink">Record an adjustment</h2>
          <p className="mb-5 mt-1 text-sm leading-relaxed text-muted">
            Never exceeds on-hand below reserved stock. Every change creates an inventory
            movement and an audit entry.
          </p>
          <InventoryAdjustmentForm productId={product.id} />
        </section>

        <section className="rounded-[16px] border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-serif text-xl text-ink">Movement history</h2>
            <p className="text-xs text-muted">The latest 30 movements</p>
          </div>
          {movements.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="No movements recorded"
                description="Restocks, reservations and adjustments will appear here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
                    <th className="px-5 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">On hand</th>
                    <th className="px-4 py-3 font-medium">Reserved</th>
                    <th className="px-4 py-3 font-medium">Reason</th>
                    <th className="px-5 py-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => (
                    <tr key={movement.id} className="border-b border-border/70 last:border-0">
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-muted">
                        {formatDateTime(movement.created_at)}
                      </td>
                      <td className="px-4 py-3 text-xs">{movementLabel(movement.movement_type)}</td>
                      <td className="px-4 py-3 tabular-nums">
                        <Delta value={movement.on_hand_delta} />
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        <Delta value={movement.reserved_delta} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">{movement.reason ?? "—"}</td>
                      <td className="px-5 py-3 text-xs text-muted">{movement.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
