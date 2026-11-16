import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, Package, Plus, Search } from "lucide-react";
import { archiveProductAction } from "@/app/admin/actions/products";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/layout";
import { listAdminProducts } from "@/lib/data/admin";
import { productImageUrl } from "@/lib/images";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; saved?: string; archived?: string }>;
}) {
  const params = await searchParams;
  const products = await listAdminProducts(params.q);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Create products, edit the story and manage imagery. Stock lives in inventory."
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add product
          </Link>
        }
      />

      {params.saved ? (
        <p className="rounded-[10px] border border-success/25 bg-success/5 px-3 py-2 text-sm text-ink">
          Product saved.
        </p>
      ) : null}
      {params.archived ? (
        <p className="rounded-[10px] border border-border bg-surface-soft px-3 py-2 text-sm text-ink">
          Product archived and removed from the storefront.
        </p>
      ) : null}

      <form method="get" className="flex max-w-xl items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <Input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search name, SKU, slug or category"
            className="pl-9"
            aria-label="Search products"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
        {params.q ? (
          <Link href="/admin/products" className="text-xs text-muted hover:text-ink">
            Clear
          </Link>
        ) : null}
      </form>

      {products.length === 0 ? (
        <EmptyState
          title={params.q ? "No products match that search" : "No products yet"}
          description={
            params.q
              ? "Try a different name or SKU."
              : "Add your first product to start building the catalog."
          }
          icon={<Package className="h-7 w-7" aria-hidden="true" />}
          action={
            <Link
              href="/admin/products/new"
              className="inline-flex h-10 items-center rounded-[10px] bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Add product
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Available</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const primary = [...(product.product_images ?? [])].sort((a, b) => {
                    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
                    return a.sort_order - b.sort_order;
                  })[0];
                  const available = product.stock_on_hand - product.stock_reserved;
                  return (
                    <tr key={product.id} className="border-b border-border/70 last:border-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 overflow-hidden rounded-[8px] border border-border bg-surface-soft">
                            {primary ? (
                              <Image
                                src={productImageUrl(primary.storage_path)}
                                alt=""
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-muted">
                                <ImageOff className="h-4 w-4" aria-hidden="true" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="block truncate font-medium text-ink hover:text-primary"
                            >
                              {product.name}
                            </Link>
                            <p className="text-xs text-muted">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {product.category?.name ?? "Uncategorised"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatCurrency(Number(product.price), product.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            available <= 0
                              ? "font-medium text-danger"
                              : available <= product.low_stock_threshold
                                ? "font-medium text-warning"
                                : "text-ink"
                          }
                        >
                          {available}
                        </span>
                        <span className="text-xs text-muted"> / {product.stock_on_hand}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {product.archived_at ? (
                            <Badge tone="neutral">Archived</Badge>
                          ) : product.is_active ? (
                            <Badge tone="success">Active</Badge>
                          ) : (
                            <Badge tone="neutral">Draft</Badge>
                          )}
                          {product.is_featured ? <Badge tone="accent">Featured</Badge> : null}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/admin/inventory/${product.id}`}
                            className="text-xs text-muted hover:text-ink"
                          >
                            Stock
                          </Link>
                          {!product.archived_at ? (
                            <form action={archiveProductAction}>
                              <input type="hidden" name="id" value={product.id} />
                              <ConfirmButton message={`Archive ${product.name}? It will disappear from the storefront.`}>
                                Archive
                              </ConfirmButton>
                            </form>
                          ) : null}
                        </div>
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
